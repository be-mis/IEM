// backend/routes/inventory.js - Fixed GET items route
const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const { logAudit, getIp } = require('../utils/auditLogger');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const XLSX = require('xlsx');

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

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
        userEmail: req.user?.email || req.email || null,
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
        userEmail: req.user?.email || req.email || null,
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
router.post('/add-exclusivity-items', verifyToken, async (req, res) => {
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
            userEmail: req.user?.email || req.email || null,
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
            userEmail: req.user?.email || req.email || null,
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
router.post('/remove-exclusivity-item', verifyToken, async (req, res) => {
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
        userEmail: req.user?.email || req.email || null,
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

// POST /api/inventory/mass-upload-exclusivity-items - Mass upload items from Excel/CSV
router.post('/mass-upload-exclusivity-items', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pool = getPool();
    let data;

    try {
      // Parse the uploaded file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(worksheet);
    } catch (parseError) {
      console.error('Error parsing file:', parseError);
      return res.status(400).json({ 
        error: 'Failed to parse file. Please ensure it is a valid Excel or CSV file.',
        message: parseError.message 
      });
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'File is empty or has no valid data' });
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    // Fetch lookup data for converting names to codes
    const [chainsData] = await pool.execute('SELECT chainCode, chainName FROM epc_chains');
    const [categoriesData] = await pool.execute('SELECT catCode, category FROM epc_categories');
    const [storeClassesData] = await pool.execute('SELECT storeClassCode, storeClassification FROM epc_store_class');

    // Create lookup maps (case-insensitive)
    const chainMap = new Map();
    chainsData.forEach(c => {
      chainMap.set(c.chainName.toLowerCase(), c.chainCode);
      chainMap.set(c.chainCode.toLowerCase(), c.chainCode); // Also support code input
    });

    const categoryMap = new Map();
    categoriesData.forEach(c => {
      categoryMap.set(c.category.toLowerCase(), c.category.toLowerCase());
      // Also allow exact code match
      const lowerCategory = c.category.toLowerCase();
      categoryMap.set(lowerCategory, lowerCategory);
    });

    const storeClassMap = new Map();
    storeClassesData.forEach(sc => {
      storeClassMap.set(sc.storeClassification.toLowerCase(), sc.storeClassCode);
      storeClassMap.set(sc.storeClassCode.toLowerCase(), sc.storeClassCode); // Also support code input
    });

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because row 1 is headers and arrays are 0-indexed

      try {
        // Extract and normalize field names (case-insensitive)
        const chainInput = row.Chain || row.chain || row.CHAIN;
        const categoryInput = row.Category || row.category || row.CATEGORY;
        const storeClassInput = row.StoreClass || row.storeClass || row.STORECLASS || row['Store Class'];
        const itemCode = row.ItemCode || row.itemCode || row.ITEMCODE || row['Item Code'];

        // Validate required fields are not empty or just whitespace
        if (!chainInput || !categoryInput || !storeClassInput || !itemCode) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCode || 'N/A',
            reason: 'Missing required fields (Chain, Category, StoreClass, or ItemCode)'
          });
          continue;
        }

        // Trim whitespace and validate they're not empty after trimming
        const chainTrimmed = String(chainInput).trim();
        const categoryTrimmed = String(categoryInput).trim();
        const storeClassTrimmed = String(storeClassInput).trim();
        const itemCodeTrimmed = String(itemCode).trim();

        if (!chainTrimmed || !categoryTrimmed || !storeClassTrimmed || !itemCodeTrimmed) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed || 'N/A',
            reason: 'One or more fields contain only whitespace'
          });
          continue;
        }

        // Validate ItemCode format (alphanumeric, no special chars except dash and underscore)
        if (!/^[A-Z0-9_-]+$/i.test(itemCodeTrimmed)) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            reason: 'Invalid ItemCode format. Only letters, numbers, dash, and underscore are allowed.'
          });
          continue;
        }

        // Convert names to codes (case-insensitive lookup)
        const chain = chainMap.get(chainTrimmed.toLowerCase());
        const category = categoryMap.get(categoryTrimmed.toLowerCase());
        const storeClass = storeClassMap.get(storeClassTrimmed.toLowerCase());

        // Validate conversions
        if (!chain) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            reason: `Invalid Chain: "${chainTrimmed}". Please use valid chain name or code.`
          });
          continue;
        }

        if (!category) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            reason: `Invalid Category: "${categoryTrimmed}". Please use valid category name.`
          });
          continue;
        }

        if (!storeClass) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            reason: `Invalid Store Class: "${storeClassTrimmed}". Please use valid store classification or code.`
          });
          continue;
        }

        // Check if ItemCode exists in epc_item_list table
        try {
          const [itemExists] = await pool.execute(`
            SELECT itemCode 
            FROM epc_item_list 
            WHERE itemCode = ?
          `, [itemCodeTrimmed]);
          
          if (itemExists.length === 0) {
            results.failed.push({
              row: rowNumber,
              itemCode: itemCodeTrimmed,
              reason: `ItemCode "${itemCodeTrimmed}" does not exist in epc_item_list table. Please verify the item code.`
            });
            continue;
          }
        } catch (itemCheckError) {
          console.error(`Error checking ItemCode ${itemCodeTrimmed}:`, itemCheckError);
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            reason: `Database error while validating ItemCode: ${itemCheckError.message}`
          });
          continue;
        }

        // Validate column name exists in database (dynamic validation)
        const columnName = `${chain}${storeClass}`;
        
        // Check if column exists in the database table
        try {
          const [columns] = await pool.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'epc_item_exclusivity_list'
              AND COLUMN_NAME = ?
          `, [columnName]);
          
          if (columns.length === 0) {
            results.failed.push({
              row: rowNumber,
              itemCode: itemCodeTrimmed,
              reason: `Invalid combination: Column "${columnName}" does not exist in database. Chain "${chainTrimmed}" and StoreClass "${storeClassTrimmed}" cannot be combined.`
            });
            continue;
          }
        } catch (colCheckError) {
          console.error(`Error checking column ${columnName}:`, colCheckError);
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            reason: `Database error while validating combination: ${colCheckError.message}`
          });
          continue;
        }

        // Upsert the item
        const upsertQuery = `
          INSERT INTO epc_item_exclusivity_list (itemCode, ${columnName}) 
          VALUES (?, 1)
          ON DUPLICATE KEY UPDATE ${columnName} = 1, updated_at = CURRENT_TIMESTAMP
        `;
        
        const [result] = await pool.execute(upsertQuery, [itemCodeTrimmed]);
        
        const action = result.affectedRows === 1 ? 'inserted' : 'updated';
        
        results.success.push({
          row: rowNumber,
          itemCode: itemCodeTrimmed,
          action,
          column: columnName
        });

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.failed.push({
          row: rowNumber,
          itemCode: row.ItemCode || row.itemCode || 'N/A',
          reason: error.message
        });
      }
    }

    // Log comprehensive audit trail with full details
    try {
      await logAudit({
        entityType: 'item_exclusivity',
        entityId: null,
        action: 'mass_upload',
        entityName: `Mass upload: ${results.success.length} successful, ${results.failed.length} failed`,
        userId: req.user?.id || null,
        userName: req.user?.username || 'System',
        userEmail: req.user?.email || req.email || null,
        ip: getIp(req),
        details: {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          uploadTimestamp: new Date().toISOString(),
          summary: {
            totalRows: data.length,
            successCount: results.success.length,
            failedCount: results.failed.length,
            skippedCount: results.skipped.length
          },
          successfulItems: results.success.map(item => ({
            row: item.row,
            itemCode: item.itemCode,
            action: item.action,
            column: item.column
          })),
          failedItems: results.failed.map(item => ({
            row: item.row,
            itemCode: item.itemCode,
            reason: item.reason
          }))
        }
      });
    } catch (auditError) {
      console.error('Error logging audit trail:', auditError);
    }

    const responseStatus = results.failed.length > 0 ? 207 : 200;
    res.status(responseStatus).json({
      message: 'File processed',
      summary: {
        total: data.length,
        success: results.success.length,
        failed: results.failed.length,
        skipped: results.skipped.length
      },
      results
    });

  } catch (error) {
    console.error('Error in mass upload:', error);
    res.status(500).json({ 
      error: 'Failed to process upload',
      message: error.message 
    });
  }
});

// POST /api/inventory/remove-exclusivity-branches - Remove branches from exclusivity by setting column to null
router.post('/remove-exclusivity-branches', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const { branchCodes, chain, category, storeClass } = req.body;

    console.log('🗑️ Remove branches request:', { branchCodes, chain, category, storeClass });

    if (!branchCodes || !Array.isArray(branchCodes) || branchCodes.length === 0) {
      return res.status(400).json({ error: 'branchCodes array is required' });
    }

    if (!chain || !category || !storeClass) {
      return res.status(400).json({ error: 'chain, category, and storeClass are required' });
    }

    // Dynamically fetch valid category columns from the database
    const [categoryColumns] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'epc_branches'
        AND COLUMN_NAME LIKE '%Class'
        AND COLUMN_NAME NOT IN ('chainCode', 'created_at', 'updated_at')
    `);
    
    // Create a map of category name to column name
    const categoryColumnMap = {};
    categoryColumns.forEach(col => {
      const columnName = col.COLUMN_NAME;
      const categoryName = columnName.replace(/Class$/, '').toLowerCase();
      categoryColumnMap[categoryName] = columnName;
    });

    // Determine the category column name
    const categoryLower = category.toLowerCase();
    const categoryColumn = categoryColumnMap[categoryLower];
    
    if (!categoryColumn) {
      return res.status(400).json({ 
        error: `Invalid category: ${category}. Valid categories: ${Object.keys(categoryColumnMap).join(', ')}`
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const branchCode of branchCodes) {
      try {
        // Update the branch's category column to NULL to remove exclusivity
        const updateQuery = `
          UPDATE epc_branches 
          SET ${categoryColumn} = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE branchCode = ?
        `;
        
        const [result] = await pool.execute(updateQuery, [branchCode]);
        
        if (result.affectedRows === 0) {
          results.failed.push({
            branchCode,
            reason: 'Branch not found'
          });
          continue;
        }

        results.success.push(branchCode);

      } catch (error) {
        console.error(`Error processing branch ${branchCode}:`, error);
        results.failed.push({
          branchCode,
          reason: error.message
        });
      }
    }

    // Log audit trail for successful removals
    if (results.success.length > 0) {
      try {
        await logAudit({
          entityType: 'branch_exclusivity',
          entityId: null,
          action: 'bulk_remove',
          entityName: `${results.success.length} branch(es)`,
          userId: req.user?.id || null,
          userName: req.user?.username || 'System',
          userEmail: req.user?.email || req.email || null,
          ip: getIp(req),
          details: {
            branchCodes: results.success,
            category,
            storeClass,
            column: categoryColumn,
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
        total: branchCodes.length,
        success: results.success.length,
        failed: results.failed.length
      },
      results
    });

  } catch (error) {
    console.error('Error removing exclusivity branches:', error);
    res.status(500).json({ 
      error: 'Failed to remove branches',
      message: error.message 
    });
  }
});

// POST /api/inventory/add-exclusivity-branches - Add branches to exclusivity list
router.post('/add-exclusivity-branches', verifyToken, async (req, res) => {
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
          userEmail: req.user?.email || req.email || null,
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

// POST /api/inventory/mass-upload-exclusivity-branches - Mass upload new branches from Excel file
router.post('/mass-upload-exclusivity-branches', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse the uploaded file from buffer (memoryStorage)
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty' });
    }

    // Get database pool
    const pool = getPool();

    // Validation results
    const results = {
      success: [],
      failed: []
    };

    // Get all chains and store classes for validation and conversion
    const [chains] = await pool.query('SELECT chainCode, chainName FROM epc_chains');
    const [storeClasses] = await pool.query('SELECT storeClassCode, storeClassification FROM epc_store_class');

    // Create lookup maps
    const chainMap = new Map();
    chains.forEach(chain => {
      chainMap.set(chain.chainName.toLowerCase().trim(), chain.chainCode);
    });

    // Map store codes - accept both code and full name
    const storeClassMap = new Map();
    storeClasses.forEach(storeClass => {
      // Map by code (e.g., "ASEH" -> "ASEH")
      storeClassMap.set(storeClass.storeClassCode.toLowerCase().trim(), storeClass.storeClassCode);
      // Also map by full name for backward compatibility
      storeClassMap.set(storeClass.storeClassification.toLowerCase().trim(), storeClass.storeClassCode);
    });

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2; // Excel row number (accounting for header)

      // Validate required fields
      const errors = [];
      
      if (!row['Store Code'] || row['Store Code'].toString().trim() === '') {
        errors.push('Store Code is required');
      }
      
      if (!row.Chain || row.Chain.toString().trim() === '') {
        errors.push('Chain is required');
      }

      if (errors.length > 0) {
        results.failed.push({
          row: rowNum,
          branchCode: row['Store Code'] || 'N/A',
          data: row,
          errors: errors,
          reason: errors.join('; ')
        });
        continue;
      }

      // Trim and prepare values
      const branchCode = row['Store Code'].toString().trim();
      const branchName = row['Store Description'] ? row['Store Description'].toString().trim() : '';
      const chainName = row.Chain.toString().trim();
      
      // Optional category class fields - now accepting store codes directly
      const lampsClass = row.LampsClass ? row.LampsClass.toString().trim() : '';
      const decorsClass = row.DecorsClass ? row.DecorsClass.toString().trim() : '';
      const clocksClass = row.ClocksClass ? row.ClocksClass.toString().trim() : '';
      const stationeryClass = row.StationeryClass ? row.StationeryClass.toString().trim() : '';
      const framesClass = row.FramesClass ? row.FramesClass.toString().trim() : '';

      // Convert chain name to code
      const chainCode = chainMap.get(chainName.toLowerCase());

      // Validate chain
      if (!chainCode) {
        errors.push(`Invalid Chain: "${chainName}"`);
      }

      // Validate store codes (if provided) - they should be codes, not full names
      let lampsClassCode = null;
      let decorsClassCode = null;
      let clocksClassCode = null;
      let stationeryClassCode = null;
      let framesClassCode = null;

      if (lampsClass) {
        // Check if it's a valid store code
        lampsClassCode = storeClassMap.get(lampsClass.toLowerCase());
        if (!lampsClassCode) {
          errors.push(`Invalid LampsClass code: "${lampsClass}"`);
        }
      }

      if (decorsClass) {
        decorsClassCode = storeClassMap.get(decorsClass.toLowerCase());
        if (!decorsClassCode) {
          errors.push(`Invalid DecorsClass code: "${decorsClass}"`);
        }
      }

      if (clocksClass) {
        clocksClassCode = storeClassMap.get(clocksClass.toLowerCase());
        if (!clocksClassCode) {
          errors.push(`Invalid ClocksClass code: "${clocksClass}"`);
        }
      }

      if (stationeryClass) {
        stationeryClassCode = storeClassMap.get(stationeryClass.toLowerCase());
        if (!stationeryClassCode) {
          errors.push(`Invalid StationeryClass code: "${stationeryClass}"`);
        }
      }

      if (framesClass) {
        framesClassCode = storeClassMap.get(framesClass.toLowerCase());
        if (!framesClassCode) {
          errors.push(`Invalid FramesClass code: "${framesClass}"`);
        }
      }

      if (errors.length > 0) {
        results.failed.push({
          row: rowNum,
          branchCode: branchCode || 'N/A',
          data: row,
          errors: errors,
          reason: errors.join('; ')
        });
        continue;
      }

      // Check if the branch exists in the database using branchCode
      const [branchCheck] = await pool.query(
        'SELECT branchCode, branchName FROM epc_branches WHERE branchCode = ?',
        [branchCode]
      );

      const storeExists = branchCheck.length > 0;
      const actualBranchName = storeExists ? branchCheck[0].branchName : branchName;

      // Insert or Update the branch with chain and category classifications
      try {
        if (storeExists) {
          // Update existing store
          await pool.query(
            `UPDATE epc_branches 
             SET chainCode = ?, lampsClass = ?, decorsClass = ?, clocksClass = ?, stationeryClass = ?, framesClass = ?
             WHERE branchCode = ?`,
            [chainCode, lampsClassCode, decorsClassCode, clocksClassCode, stationeryClassCode, framesClassCode, branchCode]
          );
        } else {
          // Insert new store
          await pool.query(
            `INSERT INTO epc_branches (branchCode, branchName, chainCode, lampsClass, decorsClass, clocksClass, stationeryClass, framesClass)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [branchCode, actualBranchName, chainCode, lampsClassCode, decorsClassCode, clocksClassCode, stationeryClassCode, framesClassCode]
          );
        }

        results.success.push({
          row: rowNum,
          branchCode: branchCode,
          branchName: actualBranchName,
          chain: chainName,
          lampsClass: lampsClass || 'N/A',
          decorsClass: decorsClass || 'N/A',
          clocksClass: clocksClass || 'N/A',
          stationeryClass: stationeryClass || 'N/A',
          framesClass: framesClass || 'N/A',
          action: storeExists ? 'Updated' : 'Created'
        });
      } catch (error) {
        results.failed.push({
          row: rowNum,
          branchCode: branchCode || branchName || 'N/A',
          data: row,
          errors: [`Database error: ${error.message}`],
          reason: `Database error: ${error.message}`
        });
      }
    }

    // Log the mass upload action
    const uploadTimestamp = new Date().toISOString();
    
    // Count created vs updated stores
    const createdCount = results.success.filter(item => item.action === 'Created').length;
    const updatedCount = results.success.filter(item => item.action === 'Updated').length;
    
    const auditDetails = {
      filename: req.file.originalname,
      fileSize: req.file.size,
      timestamp: uploadTimestamp,
      totalRows: data.length,
      successCount: results.success.length,
      createdCount: createdCount,
      updatedCount: updatedCount,
      failedCount: results.failed.length,
      successfulBranches: results.success.map(item => ({
        branchCode: item.branchCode,
        branchName: item.branchName,
        chain: item.chain,
        action: item.action,
        lampsClass: item.lampsClass,
        decorsClass: item.decorsClass,
        clocksClass: item.clocksClass,
        stationeryClass: item.stationeryClass,
        framesClass: item.framesClass
      })),
      failedBranches: results.failed.map(item => ({
        row: item.row,
        storeDescription: item.data['Store Description'],
        chain: item.data.Chain,
        errors: item.errors
      }))
    };

    await logAudit({
      entityType: 'branch_exclusivity',
      entityId: null,
      action: 'mass_upload',
      entityName: `Mass upload: ${createdCount} created, ${updatedCount} updated, ${results.failed.length} failed`,
      userId: req.user?.id || null,
      userName: req.user?.username || 'System',
      userEmail: req.user?.email || req.email || null,
      ip: getIp(req),
      details: auditDetails
    });

    // Send response
    res.json({
      message: `Mass upload completed: ${results.success.length} successful (${createdCount} created, ${updatedCount} updated), ${results.failed.length} failed`,
      summary: {
        total: data.length,
        success: results.success.length,
        created: createdCount,
        updated: updatedCount,
        failed: results.failed.length
      },
      results
    });

  } catch (error) {
    console.error('Error during mass upload:', error);
    
    res.status(500).json({ 
      error: 'Failed to process mass upload',
      message: error.message 
    });
  }
});

module.exports = router;

