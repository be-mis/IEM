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
        AND TABLE_NAME = 'epc_stores'
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
        // Update the store's category column to NULL to remove exclusivity
        const updateQuery = `
          UPDATE epc_stores 
          SET ${categoryColumn} = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE storeCode = ?
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
        AND TABLE_NAME = 'epc_stores'
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

        // Update the store's category column with the store classification
        const updateQuery = `
          UPDATE epc_stores 
          SET ${categoryColumn} = ?, updated_at = CURRENT_TIMESTAMP
          WHERE storeCode = ?
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

      // Check if the store exists in the database using storeCode
      const [storeCheck] = await pool.query(
        'SELECT storeCode, storeName FROM epc_stores WHERE storeCode = ?',
        [branchCode]
      );

      const storeExists = storeCheck.length > 0;
      const actualStoreName = storeExists ? storeCheck[0].storeName : branchName;

      // Insert or Update the branch with chain and category classifications
      try {
        if (storeExists) {
          // Update existing store
          await pool.query(
            `UPDATE epc_stores 
             SET chainCode = ?, lampsClass = ?, decorsClass = ?, clocksClass = ?, stationeryClass = ?, framesClass = ?
             WHERE storeCode = ?`,
            [chainCode, lampsClassCode, decorsClassCode, clocksClassCode, stationeryClassCode, framesClassCode, branchCode]
          );
        } else {
          // Insert new store
          await pool.query(
            `INSERT INTO epc_stores (storeCode, storeName, chainCode, lampsClass, decorsClass, clocksClass, stationeryClass, framesClass)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [branchCode, actualStoreName, chainCode, lampsClassCode, decorsClassCode, clocksClassCode, stationeryClassCode, framesClassCode]
          );
        }

        results.success.push({
          row: rowNum,
          branchCode: branchCode,
          branchName: actualStoreName,
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

// ===============================
// NBFI EXCLUSIVITY ENDPOINTS
// ===============================

// POST /api/inventory/nbfi/add-exclusivity-items - Add items to NBFI store exclusivity list
router.post('/nbfi/add-exclusivity-items', verifyToken, async (req, res) => {
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

    // New schema: nbfi_item_exclusivity_list contains per-item flags for store types: SM, RDS, WDS.
    // Expect callers to provide either a `storeType` field (SM|RDS|WDS) per item or an overall
    // `storeType` in the request body. For backward compatibility, if only `storeCode` is given,
    // attempt to derive the storeType from `nbfi_stores.categoryClass`.
    const allowedTypes = ['SM', 'RDS', 'WDS'];
    const requestLevelStoreType = (req.body.storeType || req.body.category || '') + '';

    for (const item of items) {
      try {
        const { storeCode, storeType: itemStoreType, itemCode } = item;

        if (!itemCode) {
          results.failed.push({ itemCode: itemCode || 'unknown', reason: 'Missing required field: itemCode' });
          continue;
        }

        // Determine the storeType to set for this item
        let storeType = (itemStoreType || requestLevelStoreType || '').toString().trim().toUpperCase();
        if (!storeType && storeCode) {
          // Try to derive from nbfi_stores.categoryClass
          const [rows] = await pool.execute(`SELECT categoryClass FROM nbfi_stores WHERE storeCode = ? LIMIT 1`, [storeCode]);
          if (Array.isArray(rows) && rows.length > 0) {
            storeType = String(rows[0].categoryClass || '').trim().toUpperCase();
          }
        }

        if (!allowedTypes.includes(storeType)) {
          results.failed.push({ itemCode, storeCode: storeCode || null, reason: `Invalid or missing storeType (must be one of: ${allowedTypes.join(', ')})` });
          continue;
        }

        // Ensure column exists
        const [colCheck] = await pool.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity_list' AND COLUMN_NAME = ?`,
          [storeType]
        );
        if (!Array.isArray(colCheck) || colCheck.length === 0) {
          results.failed.push({ itemCode, storeCode: storeCode || null, reason: `Store type column ${storeType} not found in nbfi_item_exclusivity_list` });
          continue;
        }

        // Try to update existing row; if none exists, insert
        const updateQuery = `UPDATE nbfi_item_exclusivity_list SET \`${storeType}\` = '1', updated_at = CURRENT_TIMESTAMP WHERE itemCode = ?`;
        const [updateRes] = await pool.execute(updateQuery, [itemCode]);
        if (updateRes.affectedRows === 0) {
          const insertQuery = `INSERT INTO nbfi_item_exclusivity_list (itemCode, \`${storeType}\`) VALUES (?, '1')`;
          await pool.execute(insertQuery, [itemCode]);
          results.success.push({ itemCode, storeType, action: 'inserted' });
        } else {
          results.success.push({ itemCode, storeType, action: 'updated' });
        }

      } catch (error) {
        console.error(`Error processing item ${item.itemCode}:`, error);
        results.failed.push({ itemCode: item.itemCode || 'unknown', storeCode: item.storeCode || null, reason: error.message });
      }
    }

    // Log audit trail for successful additions
    if (results.success.length > 0) {
      try {
        const inserted = results.success.filter(r => r.action === 'inserted');
        const updated = results.success.filter(r => r.action === 'updated');

        if (inserted.length > 0) {
          await logAudit({
            entityType: 'nbfi_store_exclusivity',
            entityId: null,
            action: 'bulk_create',
            entityName: `${inserted.length} NBFI store exclusivity item(s)`,
            userId: req.user?.id || null,
            userName: req.user?.username || 'System',
            userEmail: req.user?.email || req.email || null,
            ip: getIp(req),
            details: {
              items: inserted.map(r => ({
                itemCode: r.itemCode,
                storeCode: r.storeCode
              })),
              count: inserted.length
            }
          });
        }

        if (updated.length > 0) {
          await logAudit({
            entityType: 'nbfi_store_exclusivity',
            entityId: null,
            action: 'bulk_update',
            entityName: `${updated.length} NBFI store exclusivity item(s)`,
            userId: req.user?.id || null,
            userName: req.user?.username || 'System',
            userEmail: req.user?.email || req.email || null,
            ip: getIp(req),
            details: {
              items: updated.map(r => ({
                itemCode: r.itemCode,
                storeCode: r.storeCode
              })),
              count: updated.length
            }
          });
        }
      } catch (auditError) {
        console.error('Error logging audit trail:', auditError);
      }
    }

    const responseStatus = results.failed.length > 0 ? 207 : 200;
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
    console.error('Error adding NBFI exclusivity items:', error);
    res.status(500).json({ 
      error: 'Failed to add items',
      message: error.message 
    });
  }
});

// POST /api/inventory/nbfi/remove-exclusivity-item - Remove item from NBFI store exclusivity
router.post('/nbfi/remove-exclusivity-item', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    // New schema: per-item flags exist in nbfi_item_exclusivity_list (SM/RDS/WDS columns)
    const { itemCode, storeCode, storeType } = req.body;

    console.log('🗑️ Remove NBFI exclusivity request:', { itemCode, storeCode, storeType });

    if (!itemCode) {
      return res.status(400).json({ error: 'itemCode is required' });
    }

    const allowedTypes = ['SM', 'RDS', 'WDS'];
    let type = (storeType || '').toString().trim().toUpperCase();
    if (!type && storeCode) {
      // attempt to derive storeType from nbfi_stores.categoryClass
      const [rows] = await pool.execute(`SELECT categoryClass FROM nbfi_stores WHERE storeCode = ? LIMIT 1`, [storeCode]);
      if (Array.isArray(rows) && rows.length > 0) {
        type = String(rows[0].categoryClass || '').trim().toUpperCase();
      }
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: `storeType is required and must be one of: ${allowedTypes.join(', ')}` });
    }

    // Ensure column exists
    const [colCheck] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity_list' AND COLUMN_NAME = ?`,
      [type]
    );
    if (!Array.isArray(colCheck) || colCheck.length === 0) {
      return res.status(400).json({ error: `Store type column ${type} not found in nbfi_item_exclusivity_list` });
    }

    const deleteQuery = `UPDATE nbfi_item_exclusivity_list SET \`${type}\` = NULL, updated_at = CURRENT_TIMESTAMP WHERE itemCode = ?`;
    const [result] = await pool.execute(deleteQuery, [itemCode]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Exclusivity record not found or no change needed' });
    }

    // Log audit trail for removal
    try {
      await logAudit({
        entityType: 'nbfi_store_exclusivity',
        entityId: `${storeCode}-${itemCode}`,
        action: 'remove',
        entityName: `Removed ${itemCode} from store ${storeCode}`,
        userId: req.user?.id || null,
        userName: req.user?.username || 'System',
        userEmail: req.user?.email || req.email || null,
        ip: getIp(req),
        details: {
          itemCode,
          storeCode,
          action: 'deleted'
        }
      });
    } catch (auditError) {
      console.error('Error logging removal audit:', auditError);
    }

    res.json({ 
      success: true, 
      message: 'Item exclusivity removed successfully',
      itemCode,
      storeCode
    });

  } catch (error) {
    console.error('Error removing NBFI exclusivity item:', error);
    res.status(500).json({ 
      error: 'Failed to remove item',
      message: error.message 
    });
  }
});

// POST /api/inventory/nbfi/mass-upload-exclusivity-items - Mass upload NBFI store exclusivity items from Excel/CSV
router.post('/nbfi/mass-upload-exclusivity-items', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pool = getPool();
    let data;

    try {
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

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        const storeCode = row.StoreCode || row.storeCode || row.STORECODE || row['Store Code'];
        const itemCode = row.ItemCode || row.itemCode || row.ITEMCODE || row['Item Code'];

        if (!storeCode || !itemCode) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCode || 'N/A',
            storeCode: storeCode || 'N/A',
            reason: 'Missing required fields (StoreCode or ItemCode)'
          });
          continue;
        }

        const storeCodeTrimmed = String(storeCode).trim();
        const itemCodeTrimmed = String(itemCode).trim();

        if (!storeCodeTrimmed || !itemCodeTrimmed) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed || 'N/A',
            storeCode: storeCodeTrimmed || 'N/A',
            reason: 'One or more fields contain only whitespace'
          });
          continue;
        }

        // Validate ItemCode format
        if (!/^[A-Z0-9_-]+$/i.test(itemCodeTrimmed)) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            storeCode: storeCodeTrimmed,
            reason: 'Invalid ItemCode format. Only letters, numbers, dash, and underscore are allowed.'
          });
          continue;
        }

        // Check if ItemCode exists in nbfi_item_list table
        const [itemExists] = await pool.execute(`
          SELECT itemCode 
          FROM nbfi_item_list 
          WHERE itemCode = ?
        `, [itemCodeTrimmed]);
        
        if (itemExists.length === 0) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            storeCode: storeCodeTrimmed,
            reason: `ItemCode "${itemCodeTrimmed}" does not exist in nbfi_item_list table.`
          });
          continue;
        }

        // Check if StoreCode exists in nbfi_stores table
        const [storeExists] = await pool.execute(`
          SELECT storeCode 
          FROM nbfi_stores 
          WHERE storeCode = ?
        `, [storeCodeTrimmed]);
        
        if (storeExists.length === 0) {
          results.failed.push({
            row: rowNumber,
            itemCode: itemCodeTrimmed,
            storeCode: storeCodeTrimmed,
            reason: `StoreCode "${storeCodeTrimmed}" does not exist in nbfi_stores table.`
          });
          continue;
        }

        // Determine storeType for this store (SM|RDS|WDS) - attempt to derive from nbfi_stores.categoryClass
        const [storeRow] = await pool.execute(`SELECT categoryClass FROM nbfi_stores WHERE storeCode = ? LIMIT 1`, [storeCodeTrimmed]);
        let storeType = (Array.isArray(storeRow) && storeRow.length > 0) ? String(storeRow[0].categoryClass || '').trim().toUpperCase() : '';
        const allowedTypes = ['SM','RDS','WDS'];
        if (!allowedTypes.includes(storeType)) {
          // fallback to request-level column or default to SM
          storeType = (req.body.storeType || req.body.category || '').toString().trim().toUpperCase();
        }
        if (!allowedTypes.includes(storeType)) {
          storeType = 'SM';
        }

        // Ensure column exists
        const [colCheck] = await pool.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity_list' AND COLUMN_NAME = ?`,
          [storeType]
        );
        if (!Array.isArray(colCheck) || colCheck.length === 0) {
          // Add column automatically if missing
          await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN \`${storeType}\` VARCHAR(10) NULL`);
        }

        // Upsert into nbfi_item_exclusivity_list: set the storeType flag for this itemCode
        const updateQuery = `UPDATE nbfi_item_exclusivity_list SET \`${storeType}\` = '1', updated_at = CURRENT_TIMESTAMP WHERE itemCode = ?`;
        const [updateRes] = await pool.execute(updateQuery, [itemCodeTrimmed]);
        let action = 'updated';
        if (updateRes.affectedRows === 0) {
          const insertQuery = `INSERT INTO nbfi_item_exclusivity_list (itemCode, \`${storeType}\`) VALUES (?, '1')`;
          await pool.execute(insertQuery, [itemCodeTrimmed]);
          action = 'inserted';
        }

        results.success.push({ row: rowNumber, itemCode: itemCodeTrimmed, storeCode: storeCodeTrimmed, storeType, action });

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        results.failed.push({
          row: rowNumber,
          itemCode: row.ItemCode || row.itemCode || 'N/A',
          storeCode: row.StoreCode || row.storeCode || 'N/A',
          reason: error.message
        });
      }
    }

    // Log audit trail
    try {
      await logAudit({
        entityType: 'nbfi_store_exclusivity',
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
            storeCode: item.storeCode,
            action: item.action
          })),
          failedItems: results.failed.map(item => ({
            row: item.row,
            itemCode: item.itemCode,
            storeCode: item.storeCode,
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
    console.error('Error in NBFI mass upload:', error);
    res.status(500).json({ 
      error: 'Failed to process upload',
      message: error.message 
    });
  }
});

// POST /api/inventory/nbfi/remove-exclusivity-branches - Remove branches from NBFI store list
router.post('/nbfi/remove-exclusivity-branches', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const { branchCodes } = req.body;

    console.log('🗑️ Remove NBFI branches request:', { branchCodes });

    if (!branchCodes || !Array.isArray(branchCodes) || branchCodes.length === 0) {
      return res.status(400).json({ error: 'branchCodes array is required' });
    }

    const results = {
      success: [],
      failed: []
    };

    // Expect a brand identifier in the request body to know which brand column to unset.
    // Accept either `brand` (brandCode/name) or `category` (legacy field used by frontend as brand).
    const brandInput = req.body.brand || req.body.category;
    if (!brandInput) {
      return res.status(400).json({ error: 'Missing brand/category identifier in request body' });
    }

    // Build sanitized brand column name and ensure it exists in nbfi_store_exclusivity_list
    const sanitize = (s) => String(s || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
    const brandCol = `brand_${sanitize(brandInput)}`;

    // Verify brand column exists in exclusivity list table
    const [colCheck] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`,
      [brandCol]
    );
    if (!Array.isArray(colCheck) || colCheck.length === 0) {
      return res.status(400).json({ error: `Invalid brand '${brandInput}' or brand column not found in nbfi_store_exclusivity_list` });
    }

    for (const branchCode of branchCodes) {
      try {
        // Unset the brand flag in nbfi_store_exclusivity_list for this store
        const unsetExclusivityQuery = `
          UPDATE nbfi_store_exclusivity_list
          SET \`${brandCol}\` = NULL, updated_at = CURRENT_TIMESTAMP
          WHERE storeCode = ?
        `;
        await pool.execute(unsetExclusivityQuery, [branchCode]);

        // Also unset the brand flag in nbfi_stores if the column exists there
        const [colCheckStores] = await pool.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`,
          [brandCol]
        );
        if (Array.isArray(colCheckStores) && colCheckStores.length > 0) {
          const unsetStoreQuery = `
            UPDATE nbfi_stores
            SET \`${brandCol}\` = NULL, updated_at = CURRENT_TIMESTAMP
            WHERE storeCode = ?
          `;
          await pool.execute(unsetStoreQuery, [branchCode]);
        }

        // Optionally, keep existing behavior of deleting the store record entirely if required by callers.
        // If you still want to delete the store row, uncomment the following lines:
        // const deleteQuery = `DELETE FROM nbfi_stores WHERE storeCode = ?`;
        // await pool.execute(deleteQuery, [branchCode]);

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
          entityType: 'nbfi_branch_exclusivity',
          entityId: null,
          action: 'bulk_remove',
          entityName: `${results.success.length} NBFI branch(es)`,
          userId: req.user?.id || null,
          userName: req.user?.username || 'System',
          userEmail: req.user?.email || req.email || null,
          ip: getIp(req),
          details: {
            branchCodes: results.success,
            count: results.success.length
          }
        });
      } catch (auditError) {
        console.error('Error logging audit trail:', auditError);
      }
    }

    const responseStatus = results.failed.length > 0 ? 207 : 200;
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
    console.error('Error removing NBFI exclusivity branches:', error);
    res.status(500).json({ 
      error: 'Failed to remove branches',
      message: error.message 
    });
  }
});

// POST /api/inventory/nbfi/add-exclusivity-branches - Add branches to NBFI store list
router.post('/nbfi/add-exclusivity-branches', verifyToken, async (req, res) => {
  try {
    const pool = getPool();
    const { branches } = req.body;

    if (!branches || !Array.isArray(branches) || branches.length === 0) {
      return res.status(400).json({ error: 'Branches array is required' });
    }

    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    // We expect callers to provide brand/category information. Accept either per-branch `category`/`brand`
    // or an overall `brand` in the request body. When adding branches we will set the dynamic
    // `brand_<sanitized>` column to '1' in both `nbfi_store_exclusivity_list` and `nbfi_stores`.
    const sanitize = (s) => String(s || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();

    for (const branch of branches) {
      try {
        // Accept multiple possible field names for compatibility with different callers
        const storeCode = branch.storeCode || branch.branchCode || branch.store_code || branch.branch_code;
        const storeName = branch.storeName || branch.store_name || null;
        const chainCode = branch.chainCode || branch.chain || branch.chain_code || null;
        const storeClassification = branch.categoryClass || branch.storeClass || branch.store_class || branch.storeClassification || null;

        // Brand can come from branch or overall request
        const brandInput = branch.brand || branch.category || req.body.brand || req.body.category;
        if (!brandInput) {
          results.failed.push({ storeCode: storeCode || 'unknown', reason: 'Missing brand/category identifier' });
          continue;
        }

        if (!storeCode) {
          results.failed.push({ storeCode: 'unknown', reason: 'Missing required field: storeCode/branchCode' });
          continue;
        }

        const brandCol = `brand_${sanitize(brandInput)}`;

        // Verify brand column exists in nbfi_store_exclusivity_list
        const [colCheck] = await pool.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`,
          [brandCol]
        );
        if (!Array.isArray(colCheck) || colCheck.length === 0) {
          results.failed.push({ storeCode, reason: `Invalid brand '${brandInput}' or brand column not found` });
          continue;
        }

        // Upsert nbfi_stores (do not attempt to dynamically inject column names here)
        const upsertQuery = `
          INSERT INTO nbfi_stores (storeCode, storeName, chainCode, categoryClass)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            storeName = VALUES(storeName),
            chainCode = VALUES(chainCode),
            categoryClass = VALUES(categoryClass),
            updated_at = CURRENT_TIMESTAMP
        `;
        await pool.execute(upsertQuery, [storeCode, storeName || '', chainCode || null, storeClassification || null]);

        // Ensure a row exists in nbfi_store_exclusivity_list for this store
        const [existRows] = await pool.execute(`SELECT id FROM nbfi_store_exclusivity_list WHERE storeCode = ?`, [storeCode]);
        if (Array.isArray(existRows) && existRows.length > 0) {
          // Update existing exclusivity row: set brand flag and optionally update storeClassification
          const updateExcl = `
            UPDATE nbfi_store_exclusivity_list
            SET \`${brandCol}\` = '1', storeClassification = COALESCE(?, storeClassification), updated_at = CURRENT_TIMESTAMP
            WHERE storeCode = ?
          `;
          await pool.execute(updateExcl, [storeClassification, storeCode]);
        } else {
          // Insert new exclusivity row (set brand flag)
          const insertExcl = `
            INSERT INTO nbfi_store_exclusivity_list (storeCode, storeClassification, \`${brandCol}\`)
            VALUES (?, ?, '1')
          `;
          await pool.execute(insertExcl, [storeCode, storeClassification || null]);
        }

        // Also set brand flag in nbfi_stores if the column exists there
        const [colCheckStores] = await pool.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`,
          [brandCol]
        );
        if (Array.isArray(colCheckStores) && colCheckStores.length > 0) {
          const setStore = `UPDATE nbfi_stores SET \`${brandCol}\` = '1', updated_at = CURRENT_TIMESTAMP WHERE storeCode = ?`;
          await pool.execute(setStore, [storeCode]);
        }

        results.success.push({ storeCode, storeName, chainCode, storeClassification, brand: brandInput });

      } catch (error) {
        console.error(`Error processing branch ${branch.storeCode || branch.branchCode}:`, error);
        results.failed.push({ storeCode: branch.storeCode || branch.branchCode || 'unknown', reason: error.message });
      }
    }

    // Log audit trail for successful additions
    if (results.success.length > 0) {
      try {
        await logAudit({
          entityType: 'nbfi_branch_exclusivity',
          entityId: null,
          action: 'bulk_assign',
          entityName: `${results.success.length} NBFI branch(es)`,
          userId: req.user?.id || null,
          userName: req.user?.username || 'System',
          userEmail: req.user?.email || req.email || null,
          ip: getIp(req),
          details: {
            branches: results.success.map(r => ({
              storeCode: r.storeCode,
              storeName: r.storeName,
              chainCode: r.chainCode,
              categoryClass: r.categoryClass,
              action: r.action
            })),
            count: results.success.length
          }
        });
      } catch (auditError) {
        console.error('Error logging audit trail:', auditError);
      }
    }

    const responseStatus = results.failed.length > 0 ? 207 : 200;
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
    console.error('Error adding NBFI exclusivity branches:', error);
    res.status(500).json({ 
      error: 'Failed to add branches',
      message: error.message 
    });
  }
});

// POST /api/inventory/nbfi/mass-upload-exclusivity-branches - Mass upload NBFI branches from Excel file
router.post('/nbfi/mass-upload-exclusivity-branches', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return res.status(400).json({ error: 'The uploaded file is empty' });
    }

    const pool = getPool();
    const results = {
      success: [],
      failed: []
    };

    // Get all chains and categories for validation
    const [chains] = await pool.query('SELECT chainCode, chainName FROM nbfi_chains');
    const [categories] = await pool.query('SELECT catCode, category FROM nbfi_categories');

    const chainMap = new Map();
    chains.forEach(chain => {
      chainMap.set(chain.chainName.toLowerCase().trim(), chain.chainCode);
      chainMap.set(chain.chainCode.toLowerCase().trim(), chain.chainCode);
    });

    const categoryMap = new Map();
    categories.forEach(cat => {
      categoryMap.set(cat.category.toLowerCase().trim(), cat.catCode);
      categoryMap.set(cat.catCode.toLowerCase().trim(), cat.catCode);
    });

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 2;

      const errors = [];
      
      if (!row['Store Code'] || row['Store Code'].toString().trim() === '') {
        errors.push('Store Code is required');
      }

      if (errors.length > 0) {
        results.failed.push({
          row: rowNum,
          storeCode: row['Store Code'] || 'N/A',
          data: row,
          errors: errors,
          reason: errors.join('; ')
        });
        continue;
      }

      const storeCode = row['Store Code'].toString().trim();
      const storeName = row['Store Description'] ? row['Store Description'].toString().trim() : '';
      const chainInput = row.Chain ? row.Chain.toString().trim() : '';
      const categoryInput = row.Category ? row.Category.toString().trim() : '';

      let chainCode = null;
      let categoryClass = null;

      if (chainInput) {
        chainCode = chainMap.get(chainInput.toLowerCase());
        if (!chainCode) {
          errors.push(`Invalid Chain: "${chainInput}"`);
        }
      }

      if (categoryInput) {
        categoryClass = categoryMap.get(categoryInput.toLowerCase());
        if (!categoryClass) {
          errors.push(`Invalid Category: "${categoryInput}"`);
        }
      }

      if (errors.length > 0) {
        results.failed.push({
          row: rowNum,
          storeCode: storeCode,
          data: row,
          errors: errors,
          reason: errors.join('; ')
        });
        continue;
      }

      // Check if store exists
      const [storeCheck] = await pool.query(
        'SELECT storeCode, storeName FROM nbfi_stores WHERE storeCode = ?',
        [storeCode]
      );

      const storeExists = storeCheck.length > 0;
      const actualStoreName = storeExists ? storeCheck[0].storeName : storeName;

      try {
        if (storeExists) {
          await pool.query(
            `UPDATE nbfi_stores 
             SET storeName = ?, chainCode = ?, categoryClass = ?, updated_at = CURRENT_TIMESTAMP
             WHERE storeCode = ?`,
            [actualStoreName, chainCode, categoryClass, storeCode]
          );
        } else {
          await pool.query(
            `INSERT INTO nbfi_stores (storeCode, storeName, chainCode, categoryClass)
             VALUES (?, ?, ?, ?)`,
            [storeCode, actualStoreName, chainCode, categoryClass]
          );
        }

        results.success.push({
          row: rowNum,
          storeCode: storeCode,
          storeName: actualStoreName,
          chain: chainInput || 'N/A',
          category: categoryInput || 'N/A',
          action: storeExists ? 'Updated' : 'Created'
        });
      } catch (error) {
        results.failed.push({
          row: rowNum,
          storeCode: storeCode,
          data: row,
          errors: [`Database error: ${error.message}`],
          reason: `Database error: ${error.message}`
        });
      }
    }

    const uploadTimestamp = new Date().toISOString();
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
        storeCode: item.storeCode,
        storeName: item.storeName,
        chain: item.chain,
        category: item.category,
        action: item.action
      })),
      failedBranches: results.failed.map(item => ({
        row: item.row,
        storeCode: item.storeCode,
        errors: item.errors
      }))
    };

    await logAudit({
      entityType: 'nbfi_branch_exclusivity',
      entityId: null,
      action: 'mass_upload',
      entityName: `Mass upload: ${createdCount} created, ${updatedCount} updated, ${results.failed.length} failed`,
      userId: req.user?.id || null,
      userName: req.user?.username || 'System',
      userEmail: req.user?.email || req.email || null,
      ip: getIp(req),
      details: auditDetails
    });

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
    console.error('Error during NBFI mass upload:', error);
    
    res.status(500).json({ 
      error: 'Failed to process mass upload',
      message: error.message 
    });
  }
});

module.exports = router;

