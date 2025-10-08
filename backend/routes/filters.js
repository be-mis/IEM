// routes/filters.js
const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const mysql = require('mysql2'); // for mysql.format()

// GET /api/filters/categories
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

// GET /api/filters/store-classes
router.get('/store-classes', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, storeClassCode, storeClassification FROM store_class ORDER BY storeClassification ASC'
    );
    res.json({ items: rows.map(r => ({ id: r.id, storeClassCode: r.storeClassCode, storeClassification: r.storeClassification })) });
  } catch (err) {
    console.error('GET /filters/store-classes error:', err);
    res.status(500).json({ error: 'Failed to fetch store classes' });
  }
});

// GET /api/filters/chains (try chains table, else derive from branches)
router.get('/chains', async (req, res) => {
  try {
    const pool = getPool();
    try {
      const [rows] = await pool.execute('SELECT id, chainCode, chainName FROM chains ORDER BY chainName ASC');
      if (rows && rows.length > 0) {
        return res.json({ items: rows.map(r => ({ id: r.id, chainCode: r.chainCode, chainName: r.chainName })) });
      }
    } catch (err) {
      // If table not found, fall through to derive from branches
      if (!err || err.code !== 'ER_NO_SUCH_TABLE') {
        console.error('GET /filters/chains (chains table) error:', err);
        // continue to fallback only if table missing; otherwise return error
        return res.status(500).json({ error: 'Failed to fetch chains' });
      }
    }
    // Fallback: derive distinct chain codes from branches
    const [rows2] = await pool.execute('SELECT DISTINCT chainCode FROM branches ORDER BY chainCode ASC');
    res.json({ items: rows2.map(r => ({ id: null, chainCode: r.chainCode, chainName: r.chainCode })) });
  } catch (err) {
    console.errr('GET /filters/chains error:', err);
    res.status(500).json({ error: 'Failed to fetch chains' });
  }
});

// GET /api/filters/branches
router.get('/branches', async (req, res) => {
  try {
    let { chain, storeClass, category } = req.query;
    if (!chain || !storeClass || !category) {
      return res.status(400).json({ error: 'Missing required parameters: chain, storeClass, and category are required' });
    }

    chain = String(chain).trim();
    storeClass = String(storeClass).trim();
    category = String(category).trim().toLowerCase();

    const validColumns = {
      'lamps': 'lampsClass',
      'decors': 'decorsClass',
      'clocks': 'clocksClass',
      'stationery': 'stationeryClass',
      'frames': 'framesClass'
    };

    const columnName = validColumns[category];
    if (!columnName) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${Object.keys(validColumns).join(', ')}` });
    }

    console.log('GET /filters/branches', { chain, storeClass, category });

    const pool = getPool();
    const query = `
      SELECT branchCode, branchName
      FROM branches
      WHERE chainCode = ? AND ${columnName} = ?
      ORDER BY branchCode ASC
    `;
    const [rows] = await pool.execute(query, [chain, storeClass]);

    res.json({ items: rows.map(r => ({ branchCode: r.branchCode, branchName: r.branchName })) });
  } catch (err) {
    console.error('GET /filters/branches error:', err);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// GET /api/filters/items
router.get('/items', async (req, res) => {
  try {
    const { chain, storeClass, category } = req.query;
    if (!chain || !storeClass || !category) {
      return res.status(400).json({ error: 'Missing required parameters: chain, storeClass, category' });
    }

    // whitelist parts
    const prefixMap = {
      'vchain': 'vChain',
      'smh': 'sMH',
      'oh': 'oH'
    };
    const suffixMap = {
      'aseh': 'ASEH',
      'bsh': 'BSH',
      'csm': 'CSM',
      'dss': 'DSS',
      'eses': 'ESES'
    };

    const prefixKey = String(chain).trim().toLowerCase();
    const suffixKey = String(storeClass).trim().toLowerCase();

    console.log(`Fetching items for chain=${chain} (prefixKey=${prefixKey}), storeClass=${storeClass} (suffixKey=${suffixKey}), category=${category}`);

    if (!prefixMap[prefixKey] || !suffixMap[suffixKey]) {
      return res.status(400).json({ error: 'Invalid chain or storeClass. Examples: chain=vChain|sMH|oH and storeClass=ASEH|BSH|CSM|DSS|ESES' });
    }

    const columnName = `${prefixMap[prefixKey]}${suffixMap[suffixKey]}`; // safe because whitelisted

    const pool = getPool();
    const query = `
      SELECT i.itemCode, i.itemDescription, i.itemCategory
      FROM items i
      INNER JOIN item_exclusivity_list e ON e.itemCode = i.itemCode
      WHERE i.itemCategory = ? AND e.${columnName} = 1
      ORDER BY i.itemCode ASC
    `;

    const params = [String(category).trim()];

    // --- DEBUG: show the fully-interpolated SQL ---
    const formatted = mysql.format(query, params);
    console.log('[SQL /filters/items]', formatted);
    // Optional: expose in a response header so you can see it in the browser Network tab
    if (process.env.NODE_ENV !== 'production') {
      const safe = formatted.replace(/[\r\n]+/g, ' ').trim(); // no newlines
      res.set('X-SQL-Debug', safe.slice(0, 500));
    }
    const [rows] = await pool.execute(query, params);
    res.json({ items: rows.map(r => ({ id: r.id, itemCode: r.itemCode, itemDescription: r.itemDescription, itemCategory: r.itemCategory, quantity: 0})) });
  } catch (err) {
    console.error('GET /filters/items error:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

module.exports = router;