// routes/filters.js
const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');

/**
 * GET /api/filters/categories
 * Uses your table: categories(id, category)
 */
router.get('/categories', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, catCode, category FROM categories ORDER BY category ASC'
    );
    res.json({ items: rows.map(r => ({ id: r.id, catCode: r.catCode, category: r.category })) });
  } catch (err) {
    console.error('GET /filters/categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/filters/store-classes
 * Uses your table: store_class(id, storeClassCode, storeClassification)
 */
router.get('/store-classes', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT id, storeClassCode, storeClassification FROM store_class ORDER BY storeClassification ASC`
    );
    res.json({ items: rows.map(r => ({ id: r.id, storeClassCode: r.storeClassCode, storeClassification: r.storeClassification })) });
  } catch (err) {
    console.error('GET /filters/store-classes error:', err);
    res.status(500).json({ error: 'Failed to fetch store classes' });
  }
});

/**
 * GET /api/filters/chains
 * You have no chains master table; derive from branches(chainCode).
 * If you later add a real chains table, switch the SELECT accordingly.
 */
router.get('/chains', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, chainCode, chainName FROM chains ORDER BY chainName ASC'
    );
    // No names available, so return code as both code and name
    res.json({ items: rows.map(r => ({ id: r.id, chainCode: r.chainCode, chainName: r.chainName })) });
  } catch (err) {
    console.error('GET /filters/chains error:', err);
    res.status(500).json({ error: 'Failed to fetch chains' });
  }
});

module.exports = router;
