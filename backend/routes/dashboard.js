// backend/routes/dashboard.js
const express = require('express');
const { getPool } = require('../config/database');

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = getPool();
    
    // Get total items
    const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM inventory_items');
    const totalItems = totalResult[0].total;
    
    // Get available items
    const [availableResult] = await pool.execute('SELECT COUNT(*) as available FROM inventory_items WHERE status = ?', ['available']);
    const available = availableResult[0].available;
    
    // Get assigned items
    const [assignedResult] = await pool.execute('SELECT COUNT(*) as assigned FROM inventory_items WHERE status = ?', ['assigned']);
    const assigned = assignedResult[0].assigned;
    
    // Get maintenance items
    const [maintenanceResult] = await pool.execute('SELECT COUNT(*) as maintenance FROM inventory_items WHERE status = ?', ['maintenance']);
    const maintenance = maintenanceResult[0].maintenance;
    
    // Get retired items
    const [retiredResult] = await pool.execute('SELECT COUNT(*) as retired FROM inventory_items WHERE status = ?', ['retired']);
    const retired = retiredResult[0].retired;
    
    res.json({
      totalItems,
      available,
      assigned,
      maintenance,
      retired,
      summary: {
        activeItems: available + assigned + maintenance,
        utilizationRate: totalItems > 0 ? Math.round((assigned / totalItems) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/dashboard/recent-activity - Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const pool = getPool();
    const limit = parseInt(req.query.limit) || 10;
    
    const [activities] = await pool.execute(`
      SELECT 
        al.*,
        i.item_name,
        i.asset_tag_number,
        u.full_name as user_name
      FROM activity_logs al
      LEFT JOIN inventory_items i ON al.item_id = i.id
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [limit]);
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// GET /api/dashboard/category-breakdown - Get items by category
router.get('/category-breakdown', async (req, res) => {
  try {
    const pool = getPool();
    
    const [breakdown] = await pool.execute(`
      SELECT 
        c.name as category_name,
        COUNT(i.id) as item_count,
        SUM(CASE WHEN i.status = 'available' THEN 1 ELSE 0 END) as available_count,
        SUM(CASE WHEN i.status = 'assigned' THEN 1 ELSE 0 END) as assigned_count,
        SUM(CASE WHEN i.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_count
      FROM categories c
      LEFT JOIN inventory_items i ON c.id = i.category_id
      GROUP BY c.id, c.name
      ORDER BY item_count DESC
    `);
    
    res.json(breakdown);
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
});

// GET /api/dashboard/low-stock - Get categories or items with low availability
router.get('/low-stock', async (req, res) => {
  try {
    const pool = getPool();
    const threshold = parseInt(req.query.threshold) || 5;
    
    const [lowStock] = await pool.execute(`
      SELECT 
        c.name as category_name,
        COUNT(i.id) as total_items,
        SUM(CASE WHEN i.status = 'available' THEN 1 ELSE 0 END) as available_items
      FROM categories c
      LEFT JOIN inventory_items i ON c.id = i.category_id
      GROUP BY c.id, c.name
      HAVING available_items < ?
      ORDER BY available_items ASC
    `, [threshold]);
    
    res.json(lowStock);
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low stock information' });
  }
});

// GET /api/dashboard/assignments-due - Get items due for return
router.get('/assignments-due', async (req, res) => {
  try {
    const pool = getPool();
    const days = parseInt(req.query.days) || 7; // Default to next 7 days
    
    const [dueItems] = await pool.execute(`
      SELECT 
        ia.*,
        i.item_name,
        i.asset_tag_number,
        i.brand,
        i.model
      FROM item_assignments ia
      JOIN inventory_items i ON ia.item_id = i.id
      WHERE ia.is_active = TRUE
        AND ia.expected_return_date IS NOT NULL
        AND ia.expected_return_date <= DATE_ADD(CURRENT_DATE, INTERVAL ? DAY)
      ORDER BY ia.expected_return_date ASC
    `, [days]);
    
    res.json(dueItems);
  } catch (error) {
    console.error('Error fetching assignments due:', error);
    res.status(500).json({ error: 'Failed to fetch assignments due' });
  }
});

// GET /api/dashboard/monthly-trends - Get monthly assignment trends
router.get('/monthly-trends', async (req, res) => {
  try {
    const pool = getPool();
    const months = parseInt(req.query.months) || 6; // Default to last 6 months
    
    const [trends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(assignment_date, '%Y-%m') as month,
        COUNT(*) as assignments,
        COUNT(DISTINCT assigned_to_name) as unique_assignees
      FROM item_assignments
      WHERE assignment_date >= DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(assignment_date, '%Y-%m')
      ORDER BY month ASC
    `, [months]);
    
    res.json(trends);
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trends' });
  }
});

// GET /api/dashboard/top-users - Get users with most assignments
router.get('/top-users', async (req, res) => {
  try {
    const pool = getPool();
    const limit = parseInt(req.query.limit) || 10;
    
    const [topUsers] = await pool.execute(`
      SELECT 
        assigned_to_name,
        department,
        COUNT(*) as total_assignments,
        COUNT(CASE WHEN is_active = TRUE THEN 1 END) as current_assignments
      FROM item_assignments
      WHERE assigned_to_name IS NOT NULL
      GROUP BY assigned_to_name, department
      ORDER BY total_assignments DESC
      LIMIT ?
    `, [limit]);
    
    res.json(topUsers);
  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({ error: 'Failed to fetch top users' });
  }
});

module.exports = router;