// backend/routes/inventory.js - Fixed GET items route
const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');

// GET /api/inventory/items - Get all items with filtering (FIXED)
router.get('/items', async (req, res) => {
  try {
    const pool = getPool();
    const { status, category, search, page = 1, limit = 50 } = req.query;
    
    // FIXED: Include assigned_to and other assignment fields in SELECT
    let query = `
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
        i.notes,
        i.assigned_to,
        i.assigned_email,
        i.assigned_phone,
        i.assignment_date,
        i.createdAt,
        i.updatedAt
      FROM inventory_items i
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filtering conditions
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    
    if (category) {
      query += ' AND i.category = ?';
      params.push(category);
    }
    
    if (search) {
      query += ' AND (i.item_name LIKE ? OR i.brand LIKE ? OR i.model LIKE ? OR i.serialNumber LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY i.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const [items] = await pool.execute(query, params);
    
    // FIXED: Map database fields to what frontend expects
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
    let countQuery = `SELECT COUNT(*) as total FROM inventory_items i WHERE 1=1`;
    const countParams = [];
    
    if (status) {
      countQuery += ' AND i.status = ?';
      countParams.push(status);
    }
    
    if (category) {
      countQuery += ' AND i.category = ?';
      countParams.push(category);
    }
    
    if (search) {
      countQuery += ' AND (i.item_name LIKE ? OR i.brand LIKE ? OR i.model LIKE ? OR i.serialNumber LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);
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
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/inventory/items/:id - Get single item (FIXED)
router.get('/items/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    
    // FIXED: Include assigned_to and other assignment fields
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
    
    // FIXED: Map database fields to what frontend expects
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
      assigned_email: item.assigned_email || null,     // ✅ Add email
      assigned_phone: item.assigned_phone || null,     // ✅ Add phone
      assignment_date: item.assignment_date || null,   // ✅ Add assignment date
      created_at: item.createdAt,
      updated_at: item.updatedAt
    };
    
    res.json(mappedItem);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});
// Add this to your inventory routes file
router.put('/items/:id/dispose', async (req, res) => {
  try {
    const { id } = req.params;
    const { disposal_reason, disposed_by } = req.body;
    
    const pool = require('../config/database').getPool();
    
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
    
    res.json({ 
      success: true, 
      message: 'Item moved to disposal successfully' 
    });
  } catch (error) {
    console.error('Error moving item to disposal:', error);
    res.status(500).json({ 
      error: 'Failed to move item to disposal',
      message: error.message 
    });
  }
});

// Get disposal items
router.get('/disposal', async (req, res) => {
  try {
    const pool = require('../config/database').getPool();
    
    const [rows] = await pool.execute(
      `SELECT * FROM inventory_items 
       WHERE status = 'retired' 
       ORDER BY disposal_date DESC`
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching disposal items:', error);
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
    
    console.log('📥 Assignment request body:', req.body);
    
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
      console.log('❌ Missing assigned to name');
      return res.status(400).json({ error: 'Assigned to name is required' });
    }
    
    // First, add the missing columns if they don't exist
    try {
      await pool.execute(`
        ALTER TABLE inventory_items 
        ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255),
        ADD COLUMN IF NOT EXISTS department VARCHAR(255),
        ADD COLUMN IF NOT EXISTS assigned_email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS assigned_phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS assignment_date DATETIME
      `);
    } catch (alterError) {
      console.log('Columns may already exist:', alterError.message);
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
      'ASSIGNED', 
      assignedToName, 
      department || null,
      email || null, 
      phone || null,
      assignment_date,
      id, 
      'AVAILABLE'
    ]);
    
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found or not available for assignment' });
    }
    
    // Fetch updated item with all fields
    const [item] = await pool.execute(`
      SELECT * FROM inventory_items WHERE id = ?
    `, [id]);
    
    console.log(`✅ Assigned item ID: ${id} to ${assignedToName} (${department || 'No dept'})`);
    res.json(item[0]);
  } catch (error) {
    console.error('❌ Error assigning item:', error);
    res.status(500).json({ error: 'Failed to assign item: ' + error.message });
  }
});

module.exports = router;