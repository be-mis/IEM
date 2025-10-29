// backend/routes/dashboard.js
const express = require('express');
const { getPool } = require('../config/database');

const router = express.Router();

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = getPool();
    
    // More efficient query to get all counts in one go
    const [statsResult] = await pool.execute(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance,
        SUM(CASE WHEN status = 'retired' THEN 1 ELSE 0 END) AS retired
      FROM inventory_items
    `);

    const stats = statsResult[0];
    const totalItems = stats.total || 0;
    const available = stats.available || 0;
    const assigned = stats.assigned || 0;
    const maintenance = stats.maintenance || 0;
    const retired = stats.retired || 0;
    
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
    //console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET /api/dashboard/recent-activity - Get recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const pool = getPool();
    const limit = parseInt(req.query.limit) || 10;
    
    // Fixed: Return recent items based on updatedAt timestamp
    const [activities] = await pool.execute(`
      SELECT 
        i.id,
        i.item_name,
        i.serialNumber as asset_tag_number,
        i.status,
        i.assigned_to as user_name,
        i.updatedAt as created_at,
        CASE 
          WHEN i.status = 'assigned' THEN 'Item Assigned'
          WHEN i.status = 'available' THEN 'Item Available'
          WHEN i.status = 'maintenance' THEN 'Item in Maintenance'
          WHEN i.status = 'retired' THEN 'Item Retired'
          ELSE 'Item Updated'
        END as action
      FROM inventory_items i
      ORDER BY i.updatedAt DESC
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
    
    // Fixed: Use the actual table structure
    const [breakdown] = await pool.execute(`
      SELECT 
        i.category as category_name,
        COUNT(i.id) as item_count,
        SUM(CASE WHEN i.status = 'available' THEN 1 ELSE 0 END) as available_count,
        SUM(CASE WHEN i.status = 'assigned' THEN 1 ELSE 0 END) as assigned_count,
        SUM(CASE WHEN i.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_count
      FROM inventory_items i
      GROUP BY i.category
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
    
    // Fixed: Use the actual table structure
    const [lowStock] = await pool.execute(`
      SELECT 
        i.category as category_name,
        COUNT(i.id) as total_items,
        SUM(CASE WHEN i.status = 'available' THEN 1 ELSE 0 END) as available_items
      FROM inventory_items i
      GROUP BY i.category
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
    
    // Fixed: Use inventory_items table directly
    const [dueItems] = await pool.execute(`
      SELECT 
        i.id,
        i.item_name,
        i.serialNumber as asset_tag_number,
        i.brand,
        i.model,
        i.assigned_to,
        i.department,
        i.assignment_date,
        DATEDIFF(CURDATE(), i.assignment_date) as days_assigned
      FROM inventory_items i
      WHERE i.status = 'assigned'
        AND i.assignment_date IS NOT NULL
        AND DATEDIFF(CURDATE(), i.assignment_date) >= ?
      ORDER BY i.assignment_date ASC
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
    
    // Fixed: Use inventory_items table
    const [trends] = await pool.execute(`
      SELECT 
        DATE_FORMAT(assignment_date, '%Y-%m') as month,
        COUNT(*) as assignments,
        COUNT(DISTINCT assigned_to) as unique_assignees
      FROM inventory_items
      WHERE assignment_date >= DATE_SUB(CURRENT_DATE, INTERVAL ? MONTH)
        AND assignment_date IS NOT NULL
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
    
    // Fixed: Use inventory_items table
    const [topUsers] = await pool.execute(`
      SELECT 
        assigned_to as assigned_to_name,
        department,
        COUNT(*) as total_assignments,
        COUNT(CASE WHEN status = 'assigned' THEN 1 END) as current_assignments
      FROM inventory_items
      WHERE assigned_to IS NOT NULL
      GROUP BY assigned_to, department
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