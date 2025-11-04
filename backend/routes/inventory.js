// backend/routes/inventory.js - Fixed GET items route
const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { logAudit, getIp } = require('../utils/auditLogger');

// GET /api/inventory/items - Get all items with filtering (FIXED)
router.get('/items', async (req, res) => {
  try {
    const pool = getPool();
    const { status, category, search, page = 1, limit = 50, sort_by = 'createdAt', sort_order = 'DESC' } = req.query;
    
    // Base query
    const baseQuery = `
      SELECT 
        i.id,
        i.item_name,
        i.brand,
        i.model,
        i.serialNumber,
        i.category,
        i.status,
        i.condition,
        i.location,
        i.quantity,
        i.department,
        i.notes,
        i.assigned_to,
        i.assigned_email,
        i.assigned_phone,
        i.assignment_date,
        i.createdAt,
        i.updatedAt
      FROM inventory_items i
    `;
    
    // WHERE clause construction
    let whereClause = ' WHERE 1=1';
    const params = [];
    
    if (status) {
      whereClause += ' AND i.status = ?';
      params.push(status);
    }
    
    if (category) {
      whereClause += ' AND i.category = ?';
      params.push(category);
    }
    
    if (search) {
      whereClause += ' AND (i.item_name LIKE ? OR i.brand LIKE ? OR i.model LIKE ? OR i.serialNumber LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Whitelist sortable columns for security
    const validSortColumns = ['item_name', 'category', 'status', 'createdAt', 'updatedAt'];
    const sortBy = validSortColumns.includes(sort_by) ? `i.${sort_by}` : 'i.createdAt';
    const sortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Full query for fetching items with pagination
    const itemsQuery = `${baseQuery}${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    const itemsParams = [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)];
    
    const [items] = await pool.execute(itemsQuery, itemsParams);
    
    const mappedItems = items.map(item => ({
      id: item.id,
      item_name: item.item_name,
      brand: item.brand,
      model: item.model,
      serial_number: item.serialNumber,
      category: item.category,
      status: item.status ? item.status.toLowerCase() : 'available',
      condition_status: item.condition,
      location: item.location,
      quantity: item.quantity,
      notes: item.notes,
      assigned_to: item.assigned_to || null,           // ✅ Now properly mapped
      department: item.department || null,             // ✅ Add department
      assigned_email: item.assigned_email || null,     // ✅ Add email
      assigned_phone: item.assigned_phone || null,     // ✅ Add phone
      assignment_date: item.assignment_date || null,   // ✅ Add assignment date
      created_at: item.createdAt,
      updated_at: item.updatedAt
    }));
    
    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM inventory_items i${whereClause}`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;
    
    res.json({
      items: mappedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    //console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/inventory/items/:id - Get single item (FIXED)
router.get('/items/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    
    const [items] = await pool.execute(`
      SELECT 
        i.id,
        i.item_name,
        i.brand,
        i.model,
        i.serialNumber,
        i.category,
        i.status,
        i.condition,
        i.location,
        i.quantity,
        i.department,
        i.notes,
        i.assigned_to,
        i.assigned_email,
        i.assigned_phone,
        i.assignment_date,
        i.createdAt,
        i.updatedAt
      FROM inventory_items i
      WHERE i.id = ?
    `, [id]);
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const item = items[0];
    const mappedItem = {
      id: item.id,
      item_name: item.item_name,
      brand: item.brand,
      model: item.model,
      serial_number: item.serialNumber,
      category: item.category,
      status: item.status ? item.status.toLowerCase() : 'available',
      condition_status: item.condition,
      location: item.location,
      quantity: item.quantity,
      notes: item.notes,
      assigned_to: item.assigned_to || null,           // ✅ Now properly mapped
      department: item.department || null,             // ✅ Now properly mapped
      assigned_email: item.assigned_email || null,     // ✅ Add email
      assigned_phone: item.assigned_phone || null,     // ✅ Add phone
      assignment_date: item.assignment_date || null,   // ✅ Add assignment date
      created_at: item.createdAt,
      updated_at: item.updatedAt
    };
    
    res.json(mappedItem);
  } catch (error) {
    //console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});
// Add this to your inventory routes file
router.put('/items/:id/dispose', async (req, res) => {
  try {
    const { id } = req.params;
    const { disposal_reason, disposed_by } = req.body;
    
    const pool = getPool();
    
    const [result] = await pool.execute(
      `UPDATE inventory_items 
       SET status = 'retired', 
           disposal_reason = ?, 
           disposal_date = NOW(), 
           disposed_by = ?
       WHERE id = ?`,
      [disposal_reason, disposed_by || 'System', id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Log audit trail for disposal
    try {
      await logAudit({
        entityType: 'item',
        entityId: id,
        action: 'dispose',
        entityName: 'Item disposed',
        userId: req.user?.id || null,
        userName: req.user?.username || disposed_by || 'System',
        ip: getIp(req),
        details: {
          reason: disposal_reason,
          disposedBy: disposed_by || 'System',
          disposalDate: new Date().toISOString()
        }
      });
    } catch (auditError) {
      console.error('Error logging disposal audit:', auditError);
    }
    
    res.json({ 
      success: true, 
      message: 'Item moved to disposal successfully' 
    });
  } catch (error) {
    //console.error('Error moving item to disposal:', error);
    res.status(500).json({ 
      error: 'Failed to move item to disposal',
      message: error.message 
    });
  }
});

// Get disposal items
router.get('/disposal', async (req, res) => {
  try {
    const pool = getPool();
    
    const [rows] = await pool.execute(
      `SELECT * FROM inventory_items 
       WHERE status = 'retired' 
       ORDER BY disposal_date DESC`
    );
    
    res.json(rows);
  } catch (error) {
    //console.error('Error fetching disposal items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch disposal items',
      message: error.message 
    });
  }
});

// Also need to fix the checkout route to store department
router.post('/items/:id/checkout', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    
    //console.log('📥 Assignment request body:', req.body);
    
    const {
      assigned_to_name, 
      assignedTo,  
      department, 
      email, 
      phone,
      assignment_date = new Date().toISOString()
    } = req.body;
    
    const assignedToName = assigned_to_name || assignedTo;
    
    if (!assignedToName) {
      //console.log('❌ Missing assigned to name');
      return res.status(400).json({ error: 'Assigned to name is required' });
    }
    
    // FIXED: Update item with assignment details including department
    const [updateResult] = await pool.execute(`
      UPDATE inventory_items 
      SET status = ?, 
          assigned_to = ?, 
          department = ?,
          assigned_email = ?, 
          assigned_phone = ?,
          assignment_date = ?,
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ? AND status = ?
    `, [
      'assigned',  // Use lowercase for consistency
      assignedToName, 
      department || null,
      email || null, 
      phone || null,
      assignment_date,
      id, 
      'available'  // Use lowercase for consistency
    ]);
    
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found or not available for assignment' });
    }
    
    // Fetch updated item with all fields
    const [item] = await pool.execute(`
      SELECT * FROM inventory_items WHERE id = ?
    `, [id]);
    
    // Log audit trail for checkout
    try {
      await logAudit({
        entityType: 'item',
        entityId: id,
        action: 'checkout',
        entityName: `Item assigned to ${assignedToName}`,
        userId: req.user?.id || null,
        userName: req.user?.username || 'System',
        ip: getIp(req),
        details: {
          assignedTo: assignedToName,
          department: department || null,
          email: email || null,
          phone: phone || null,
          assignmentDate: assignment_date
        }
      });
    } catch (auditError) {
      console.error('Error logging checkout audit:', auditError);
    }
    
    //console.log(`✅ Assigned item ID: ${id} to ${assignedToName} (${department || 'No dept'})`);
    res.json(item[0]);
  } catch (error) {
    //console.error('❌ Error assigning item:', error);
    res.status(500).json({ error: 'Failed to assign item: ' + error.message });
  }
});

// POST /api/inventory/add-exclusivity-items - Add items to exclusivity list
router.post('/add-exclusivity-items', async (req, res) => {
  try {
    const pool = getPool();
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    for (const item of items) {
      try {
        const { chain, category, storeClass, itemCode } = item;

        // Validate required fields
        if (!chain || !category || !storeClass || !itemCode) {
          results.failed.push({
            itemCode: itemCode || 'unknown',
            reason: 'Missing required fields: chain, category, storeClass, or itemCode'
          });
          continue;
        }

        // Build column name by combining chain + storeClass (e.g., VChainASEH, SMHBSH, OHCSM)
        const columnName = `${chain}${storeClass}`;

        // Optimized INSERT using only the specific column needed
        const upsertQuery = `
          INSERT INTO epc_item_exclusivity_list (itemCode, ${columnName}) 
          VALUES (?, 1)
          ON DUPLICATE KEY UPDATE ${columnName} = 1, updated_at = CURRENT_TIMESTAMP
        `;
        
        const [result] = await pool.execute(upsertQuery, [itemCode]);
        
        // Check if it was an insert (affectedRows = 1) or update (affectedRows = 2)
        const action = result.affectedRows === 1 ? 'inserted' : 'updated';
        
        results.success.push({
          itemCode,
          action,
          column: columnName
        });

      } catch (error) {
        console.error(`Error processing item ${item.itemCode}:`, error);
        results.failed.push({
          itemCode: item.itemCode,
          reason: error.message
        });
      }
    }

    // Log audit trail for successful additions
    if (results.success.length > 0) {
      try {
        // Group by action type for cleaner logging
        const inserted = results.success.filter(r => r.action === 'inserted');
        const updated = results.success.filter(r => r.action === 'updated');

        // Log insertions
        if (inserted.length > 0) {
          await logAudit({
            entityType: 'item_exclusivity',
            entityId: null,
            action: 'bulk_create',
            entityName: `${inserted.length} item(s)`,
            userId: req.user?.id || null,
            userName: req.user?.username || 'System',
            ip: getIp(req),
            details: {
              items: inserted.map(r => ({
                itemCode: r.itemCode,
                column: r.column
              })),
              count: inserted.length
            }
          });
        }

        // Log updates
        if (updated.length > 0) {
          await logAudit({
            entityType: 'item_exclusivity',
            entityId: null,
            action: 'bulk_update',
            entityName: `${updated.length} item(s)`,
            userId: req.user?.id || null,
            userName: req.user?.username || 'System',
            ip: getIp(req),
            details: {
              items: updated.map(r => ({
                itemCode: r.itemCode,
                column: r.column
              })),
              count: updated.length
            }
          });
        }
      } catch (auditError) {
        // Log audit errors but don't fail the request
        console.error('Error logging audit trail:', auditError);
      }
    }

    const responseStatus = results.failed.length > 0 ? 207 : 200; // 207 Multi-Status if some failed
    res.status(responseStatus).json({
      message: 'Items processed',
      summary: {
        total: items.length,
        success: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results
    });

  } catch (error) {
    console.error('Error adding exclusivity items:', error);
    res.status(500).json({ 
      error: 'Failed to add items',
      message: error.message 
    });
  }
});

// DELETE /api/inventory/remove-exclusivity-item - Remove item from exclusivity by setting column to 0
router.post('/remove-exclusivity-item', async (req, res) => {
  try {
    const pool = getPool();
    const { itemCode, column } = req.body;

    console.log('🗑️ Remove request:', { itemCode, column });

    if (!itemCode || !column) {
      return res.status(400).json({ error: 'itemCode and column are required' });
    }

    // Dynamically fetch valid columns from the database
    const [columns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'epc_item_exclusivity_list'
        AND COLUMN_NAME NOT IN ('itemCode', 'created_at', 'updated_at')
    `);
    
    const validColumns = columns.map(col => col.COLUMN_NAME);

    if (!validColumns.includes(column)) {
      console.error('❌ Invalid column name received:', {
        received: column,
        receivedLength: column.length,
        receivedChars: column.split('').map((c, i) => `${i}:${c}(${c.charCodeAt(0)})`),
        validColumns: validColumns
      });
      return res.status(400).json({ 
        error: 'Invalid column name. Column name must match one of the valid database columns.',
        received: column,
        validColumns: validColumns,
        hint: 'Valid format: chainCode + storeClassCode (e.g., vChainASEH, sMHBSH, oHCSM)'
      });
    }

    // Update the specific column to 0 instead of deleting the row
    const updateQuery = `
      UPDATE epc_item_exclusivity_list 
      SET ${column} = 0, updated_at = CURRENT_TIMESTAMP
      WHERE itemCode = ?
    `;
    
    console.log('📝 Executing query:', updateQuery, 'with itemCode:', itemCode);
    const [result] = await pool.execute(updateQuery, [itemCode]);
    console.log('✅ Update result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found in database' });
    }

    // Log audit trail for removal
    try {
      await logAudit({
        entityType: 'item_exclusivity',
        entityId: itemCode,
        action: 'remove',
        entityName: `Removed ${column} from ${itemCode}`,
        userId: req.user?.id || null,
        userName: req.user?.username || 'System',
        ip: getIp(req),
        details: {
          itemCode,
          column,
          action: 'set_to_zero'
        }
      });
    } catch (auditError) {
      console.error('Error logging removal audit:', auditError);
    }

    res.json({ 
      success: true, 
      message: 'Item exclusivity removed successfully',
      itemCode,
      column
    });

  } catch (error) {
    console.error('Error removing exclusivity item:', error);
    res.status(500).json({ 
      error: 'Failed to remove item',
      message: error.message 
    });
  }
});

// POST /api/inventory/add-exclusivity-branches - Add branches to exclusivity list
router.post('/add-exclusivity-branches', async (req, res) => {
  try {
    const pool = getPool();
    const { branches } = req.body;

    if (!branches || !Array.isArray(branches) || branches.length === 0) {
      return res.status(400).json({ error: 'Branches array is required' });
    }

    // Dynamically fetch valid category columns from the database (once, outside the loop)
    const [categoryColumns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'epc_branches'
        AND COLUMN_NAME LIKE '%Class'
        AND COLUMN_NAME NOT IN ('chainCode', 'created_at', 'updated_at')
    `);
    
    // Create a map of category name to column name for O(1) lookup
    // e.g., { 'lamps': 'lampsClass', 'decors': 'decorsClass', ... }
    const categoryColumnMap = {};
    categoryColumns.forEach(col => {
      const columnName = col.COLUMN_NAME;
      // Extract category name by removing 'Class' suffix (e.g., 'lampsClass' -> 'lamps')
      const categoryName = columnName.replace(/Class$/, '').toLowerCase();
      categoryColumnMap[categoryName] = columnName;
    });

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    for (const branch of branches) {
      try {
        const { chain, category, storeClass, branchCode } = branch;

        // Validate required fields
        if (!chain || !category || !storeClass || !branchCode) {
          results.failed.push({
            branchCode: branchCode || 'unknown',
            reason: 'Missing required fields: chain, category, storeClass, or branchCode'
          });
          continue;
        }

        // Determine the category column name dynamically using the map
        const categoryLower = category.toLowerCase();
        const categoryColumn = categoryColumnMap[categoryLower];
        
        if (!categoryColumn) {
          results.failed.push({
            branchCode,
            reason: `Invalid category: ${category}. Valid categories: ${Object.keys(categoryColumnMap).join(', ')}`
          });
          continue;
        }

        // Update the branch's category column with the store classification
        const updateQuery = `
          UPDATE epc_branches 
          SET ${categoryColumn} = ?, updated_at = CURRENT_TIMESTAMP
          WHERE branchCode = ?
        `;
        
        const [result] = await pool.execute(updateQuery, [storeClass, branchCode]);
        
        if (result.affectedRows === 0) {
          results.failed.push({
            branchCode,
            reason: 'Branch not found'
          });
          continue;
        }

        results.success.push({
          branchCode,
          category,
          storeClass,
          column: categoryColumn
        });

      } catch (error) {
        console.error(`Error processing branch ${branch.branchCode}:`, error);
        results.failed.push({
          branchCode: branch.branchCode,
          reason: error.message
        });
      }
    }

    // Log audit trail for successful additions
    if (results.success.length > 0) {
      try {
        await logAudit({
          entityType: 'branch_exclusivity',
          entityId: null,
          action: 'bulk_assign',
          entityName: `${results.success.length} branch(es)`,
          userId: req.user?.id || null,
          userName: req.user?.username || 'System',
          ip: getIp(req),
          details: {
            branches: results.success.map(r => ({
              branchCode: r.branchCode,
              category: r.category,
              storeClass: r.storeClass,
              column: r.column
            })),
            count: results.success.length
          }
        });
      } catch (auditError) {
        console.error('Error logging audit trail:', auditError);
      }
    }

    const responseStatus = results.failed.length > 0 ? 207 : 200; // 207 Multi-Status if some failed
    res.status(responseStatus).json({
      message: 'Branches processed',
      summary: {
        total: branches.length,
        success: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results
    });

  } catch (error) {
    console.error('Error adding exclusivity branches:', error);
    res.status(500).json({ 
      error: 'Failed to add branches',
      message: error.message 
    });
  }
});

module.exports = router;