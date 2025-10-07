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
    // console.error('GET /filters/categories error:', err);
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
    // console.error('GET /filters/store-classes error:', err);
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
    // console.error('GET /filters/chains error:', err);
    res.status(500).json({ error: 'Failed to fetch chains' });
  }
});

router.get('/branches', async (req, res) => {
  try {
    const { chain, storeClass, category } = req.query;
    
    // Validate that we have the required parameters
    if (!chain || !storeClass || !category) {
      return res.status(400).json({ 
        error: 'Missing required parameters: chain, storeClass, and category are required' 
      });
    }

    // Normalize the category to match column name (e.g., "lamps" -> "lampsClass")
    const normalizedCategory = `${String(category).toLowerCase()}Class`;
    
    // Validate the category column exists (whitelist approach for security)
    const validColumns = ['lampsClass', 'decorsClass', 'clocksClass', 'stationeryClass', 'framesClass'];
    if (!validColumns.includes(normalizedCategory)) {
      return res.status(400).json({ 
        error: `Invalid category. Must be one of: lamps, decors, clocks, stationery, frames` 
      });
    }

    // console.log('Filters:', { chain, storeClass, category, normalizedCategory });

    const pool = getPool();
    
    // Use parameterized query for security
    const query = `
      SELECT branchCode, branchName
      FROM branches
      WHERE chainCode = ? AND ${normalizedCategory} = ?
      ORDER BY branchCode ASC
    `;
    
    const [rows] = await pool.execute(query, [chain, storeClass]);

    res.json({
      items: rows.map(r => ({
        branchCode: r.branchCode,
        branchName: r.branchName,
      })),
    });
  } catch (err) {
    // console.error('GET /filters/branches error:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

module.exports = router;