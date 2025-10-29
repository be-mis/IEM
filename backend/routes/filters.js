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
      'SELECT id, catCode, category FROM epc_categories ORDER BY category ASC'
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
      'SELECT id, storeClassCode, storeClassification FROM epc_store_class ORDER BY storeClassification ASC'
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
      const [rows] = await pool.execute('SELECT id, chainCode, chainName FROM epc_chains ORDER BY chainName ASC');
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
    const [rows2] = await pool.execute('SELECT DISTINCT chainCode FROM epc_branches ORDER BY chainCode ASC');
    res.json({ items: rows2.map(r => ({ id: null, chainCode: r.chainCode, chainName: r.chainCode })) });
  } catch (err) {
    console.error('GET /filters/chains error:', err);
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
      FROM epc_branches
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

    // whitelist parts - Map chain and store class to build column name
    const prefixMap = { vchain: 'vChain', smh: 'sMH', oh: 'oH' };
    const suffixMap = { 
      aseh: 'ASEH', 
      bsh: 'BSH', 
      csm: 'CSM', 
      dss: 'DSS', 
      eses: 'ESES' 
    };

    const prefixKey = String(chain).trim().toLowerCase();
    const suffixKey = String(storeClass).trim().toLowerCase();

    console.log(`Fetching items for chain=${chain} (prefixKey=${prefixKey}), storeClass=${storeClass} (suffixKey=${suffixKey}), category=${category}`);

    if (!prefixMap[prefixKey] || !suffixMap[suffixKey]) {
      return res.status(400).json({
        error: 'Invalid chain or storeClass. Examples: chain=vChain|sMH|oH and storeClass=ASEH|BSH|CSM|DSS|ESES'
      });
    }

    // Build column name using full suffix (e.g., vChainASEH, sMHBSH, oHCSM)
    const columnName = `${prefixMap[prefixKey]}${suffixMap[suffixKey]}`;
    const categoryLower = String(category).trim().toLowerCase(); // normalize once
    
    console.log(`Column name constructed: ${columnName}`);

    const pool = getPool();
    const query = `
      SELECT i.itemCode, i.itemDescription, i.itemCategory
      FROM epc_item_list i
      INNER JOIN epc_item_exclusivity_list e ON e.itemCode = i.itemCode
      WHERE LOWER(i.itemCategory) = ? AND e.${columnName} = 1
      ORDER BY i.itemCode ASC
    `;

    const params = [categoryLower];

    // Safe debug header (dev only) – strip non-printables & newlines
    if (process.env.NODE_ENV !== 'production') {
      const mysql = require('mysql2');
      const formatted = mysql.format(query, params);
      const safe = formatted.replace(/[^\x20-\x7E]+/g, ' ').trim().slice(0, 500);
      res.set('X-SQL-Debug', safe);
    }

    const [rows] = await pool.execute(query, params);
    res.json({
      items: rows.map(r => ({
        itemCode: r.itemCode,
        itemDescription: r.itemDescription,
        itemCategory: r.itemCategory,
        quantity: 0
      }))
    });
  } catch (err) {
    console.error('GET /filters/items error:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// GET /api/filters/available-items - Get items not yet in exclusivity list
router.get('/available-items', async (req, res) => {
  try {
    const { chain, storeClass, category } = req.query;
    if (!chain || !storeClass || !category) {
      return res.status(400).json({ error: 'Missing required parameters: chain, storeClass, category' });
    }

    // Build column name for exclusivity check
    const prefixMap = { vchain: 'vChain', smh: 'sMH', oh: 'oH' };
    const suffixMap = { 
      aseh: 'ASEH', 
      bsh: 'BSH', 
      csm: 'CSM', 
      dss: 'DSS', 
      eses: 'ESES' 
    };

    const prefixKey = String(chain).trim().toLowerCase();
    const suffixKey = String(storeClass).trim().toLowerCase();

    if (!prefixMap[prefixKey] || !suffixMap[suffixKey]) {
      return res.status(400).json({
        error: 'Invalid chain or storeClass. Examples: chain=vChain|sMH|oH and storeClass=ASEH|BSH|CSM|DSS|ESES'
      });
    }

    const columnName = `${prefixMap[prefixKey]}${suffixMap[suffixKey]}`;
    const categoryLower = String(category).trim().toLowerCase();

    console.log(`Fetching available items - Column: ${columnName}, Category: ${categoryLower}`);

    const pool = getPool();
    
    // Get all items from epc_item_list for this category
    // that either don't exist in exclusivity list OR have the column set to 'NA'
    const query = `
      SELECT i.itemCode, i.itemDescription, i.itemCategory
      FROM epc_item_list i
      LEFT JOIN epc_item_exclusivity_list e ON e.itemCode = i.itemCode
      WHERE LOWER(i.itemCategory) = ? 
        AND (e.itemCode IS NULL OR e.${columnName} = 'NA' OR e.${columnName} IS NULL)
      ORDER BY i.itemCode ASC
    `;

    const [rows] = await pool.execute(query, [categoryLower]);
    
    res.json({
      items: rows.map(r => ({
        itemCode: r.itemCode,
        itemDescription: r.itemDescription,
        itemCategory: r.itemCategory
      }))
    });
  } catch (err) {
    console.error('GET /filters/available-items error:', err);
    res.status(500).json({ error: 'Failed to fetch available items' });
  }
});

// GET /filters/available-branches - Fetch branches NOT in exclusivity for chain/category/storeClass
router.get('/available-branches', async (req, res) => {
  try {
    const { chain, category, storeClass } = req.query;

    if (!chain || !category || !storeClass) {
      return res.status(400).json({ error: 'Chain, category, and storeClass are required' });
    }

    // Normalize inputs
    const chainValue = String(chain).trim();
    const categoryLower = String(category).trim().toLowerCase();
    const storeClassValue = String(storeClass).trim();

    // Validate category and get the column name for epc_branches table
    const validColumns = {
      'lamps': 'lampsClass',
      'decors': 'decorsClass',
      'clocks': 'clocksClass',
      'stationery': 'stationeryClass',
      'frames': 'framesClass'
    };

    const categoryColumn = validColumns[categoryLower];
    if (!categoryColumn) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${Object.keys(validColumns).join(', ')}` });
    }

    // Build exclusivity column name (e.g., vChainASEH, sMHBSH, oHCSM)
    const prefixMap = { vchain: 'vChain', smh: 'sMH', oh: 'oH' };
    const suffixMap = { 
      aseh: 'ASEH', 
      bsh: 'BSH', 
      csm: 'CSM', 
      dss: 'DSS', 
      eses: 'ESES' 
    };

    const prefixKey = chainValue.toLowerCase();
    const suffixKey = storeClassValue.toLowerCase();

    if (!prefixMap[prefixKey] || !suffixMap[suffixKey]) {
      return res.status(400).json({
        error: 'Invalid chain or storeClass. Examples: chain=vChain|sMH|oH and storeClass=ASEH|BSH|CSM|DSS|ESES'
      });
    }

    const exclusivityColumn = `${prefixMap[prefixKey]}${suffixMap[suffixKey]}`;

    console.log(`Fetching available branches - Chain: ${chainValue}, Category: ${categoryLower} (${categoryColumn}), StoreClass: ${storeClassValue}, ExclusivityColumn: ${exclusivityColumn}`);

    const pool = getPool();
    
    // Get all branches from epc_branches where:
    // 1. chainCode matches the selected chain (e.g., 'vChain')
    // 2. The category column (e.g., lampsClass) is NULL, 'NA', or NOT equal to storeClass
    const query = `
      SELECT b.branchCode, b.branchName, b.chainCode, b.${categoryColumn}
      FROM epc_branches b
      WHERE b.chainCode = ? 
        AND (b.${categoryColumn} IS NULL OR b.${categoryColumn} = 'NA' OR b.${categoryColumn} != ?)
      ORDER BY b.branchCode ASC
    `;

    const [rows] = await pool.execute(query, [chainValue, storeClassValue]);
    
    res.json({
      items: rows.map(r => ({
        branchCode: r.branchCode,
        branchName: r.branchName,
        chainCode: r.chainCode,
        storeClass: r[categoryColumn]
      }))
    });
  } catch (err) {
    console.error('GET /filters/available-branches error:', err);
    res.status(500).json({ error: 'Failed to fetch available branches' });
  }
});

module.exports = router;