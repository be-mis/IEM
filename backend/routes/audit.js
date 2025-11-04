// backend/routes/audit.js
const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');

// GET /api/audit/logs - Get audit logs with filtering
router.get('/logs', async (req, res) => {
  try {
    const pool = getPool();
    const { 
      limit = 100, 
      offset = 0,
      entityType,
      action,
      userName,
      startDate,
      endDate
    } = req.query;

    // Build WHERE clause
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (entityType) {
      whereClause += ' AND entity_type = ?';
      params.push(entityType);
    }

    if (action) {
      whereClause += ' AND action = ?';
      params.push(action);
    }

    if (userName) {
      whereClause += ' AND user_name = ?';
      params.push(userName);
    }

    if (startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(endDate);
    }

    // Get logs with pagination
    const query = `
      SELECT 
        id,
        entity_type,
        entity_id,
        action,
        entity_name,
        user_id,
        user_name,
        ip_address,
        details,
        created_at
      FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [logs] = await pool.execute(query, [...params, parseInt(limit), parseInt(offset)]);

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs${whereClause}`;
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0].total;

    res.json({
      logs,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch audit logs',
      message: error.message 
    });
  }
});

// GET /api/audit/stats - Get audit log statistics
router.get('/stats', async (req, res) => {
  try {
    const pool = getPool();

    // Get counts by entity type
    const [entityStats] = await pool.execute(`
      SELECT entity_type, COUNT(*) as count
      FROM audit_logs
      GROUP BY entity_type
      ORDER BY count DESC
    `);

    // Get counts by action
    const [actionStats] = await pool.execute(`
      SELECT action, COUNT(*) as count
      FROM audit_logs
      GROUP BY action
      ORDER BY count DESC
    `);

    // Get recent activity count (last 24 hours)
    const [recentActivity] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM audit_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    // Get most active users
    const [topUsers] = await pool.execute(`
      SELECT user_name, COUNT(*) as count
      FROM audit_logs
      WHERE user_name IS NOT NULL
      GROUP BY user_name
      ORDER BY count DESC
      LIMIT 10
    `);

    res.json({
      entityStats,
      actionStats,
      recentActivity: recentActivity[0].count,
      topUsers
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch audit statistics',
      message: error.message 
    });
  }
});

module.exports = router;
