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
    // Fallback: derive distinct chain codes from stores
    const [rows2] = await pool.execute('SELECT DISTINCT chainCode FROM epc_stores ORDER BY chainCode ASC');
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
      SELECT storeCode, storeName
      FROM epc_stores
      WHERE chainCode = ? AND ${columnName} = ?
      ORDER BY storeCode ASC
    `;
    const [rows] = await pool.execute(query, [chain, storeClass]);

    res.json({ items: rows.map(r => ({ branchCode: r.storeCode, branchName: r.storeName })) });
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
      SELECT DISTINCT i.itemCode, i.itemDescription, i.itemCategory
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

    console.log(`\n=== Fetching Available Items ===`);
    console.log(`Column: ${columnName}, Category: ${categoryLower}`);

    const pool = getPool();
    
    // First, let's check total items in epc_item_list for this category
    const [totalItems] = await pool.execute(
      `SELECT DISTINCT itemCode, itemDescription FROM epc_item_list WHERE LOWER(itemCategory) = ?`,
      [categoryLower]
    );
    console.log(`Total DISTINCT items in epc_item_list for category '${categoryLower}': ${totalItems.length}`);
    console.log('All items:', totalItems.map(i => `${i.itemCode} - ${i.itemDescription}`).join('\n  '));
    
    // Check which items exist in exclusivity list
    const [exclusivityItems] = await pool.execute(
      `SELECT itemCode, ${columnName} as columnValue FROM epc_item_exclusivity_list WHERE itemCode IN (${totalItems.map(() => '?').join(',')})`,
      totalItems.map(i => i.itemCode)
    );
    console.log(`Items in epc_item_exclusivity_list: ${exclusivityItems.length}`);
    console.log('Exclusivity items:', exclusivityItems.map(e => `${e.itemCode}(${e.columnValue})`).join(', '));
    
    // Get all items from epc_item_list for this category
    // Show items that are NOT currently assigned (column value != 1)
    // This includes: items not in exclusivity table, or items where the column is not 1
    const query = `
      SELECT DISTINCT i.itemCode, i.itemDescription, i.itemCategory, e.${columnName} as columnValue, e.itemCode as existsInExclusivity
      FROM epc_item_list i
      LEFT JOIN epc_item_exclusivity_list e ON i.itemCode = e.itemCode
      WHERE LOWER(i.itemCategory) = ? 
        AND (e.itemCode IS NULL OR e.${columnName} IS NULL OR e.${columnName} != 1)
      ORDER BY i.itemCode ASC
    `;

    const [rows] = await pool.execute(query, [categoryLower]);
    
    console.log(`Available items returned: ${rows.length}`);
    console.log('Items:', rows.map(r => `${r.itemCode} (exists:${r.existsInExclusivity ? 'yes' : 'no'}, ${columnName}=${r.columnValue})`).join(', '));
    console.log(`================================\n`);
    
    const response = {
      items: rows.map(r => ({
        itemCode: r.itemCode,
        itemDescription: r.itemDescription,
        itemCategory: r.itemCategory
      }))
    };
    
    console.log(`Returning ${response.items.length} items to frontend\n`);
    res.json(response);
  } catch (err) {
    console.error('GET /filters/available-items error:', err);
    res.status(500).json({ error: 'Failed to fetch available items' });
  }
});

// GET /api/filters/items-for-assignment - New endpoint specifically for Item Maintenance
// Returns all items from epc_item_list that are available for assignment
router.get('/items-for-assignment', async (req, res) => {
  try {
    const { chain, storeClass, category } = req.query;
    
    if (!chain || !storeClass || !category) {
      return res.status(400).json({ error: 'Missing required parameters: chain, storeClass, category' });
    }

    // Build column name
    const prefixMap = { vchain: 'vChain', smh: 'sMH', oh: 'oH' };
    const suffixMap = { aseh: 'ASEH', bsh: 'BSH', csm: 'CSM', dss: 'DSS', eses: 'ESES' };
    
    const prefixKey = String(chain).trim().toLowerCase();
    const suffixKey = String(storeClass).trim().toLowerCase();
    
    if (!prefixMap[prefixKey] || !suffixMap[suffixKey]) {
      return res.status(400).json({ error: 'Invalid chain or storeClass' });
    }
    
    const columnName = `${prefixMap[prefixKey]}${suffixMap[suffixKey]}`;
    // Capitalize first letter of category (e.g., "decors" -> "Decors")
    const categoryValue = String(category).trim();
    const categoryCapitalized = categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1).toLowerCase();
    
    console.log(`\n=== Items for Assignment ===`);
    console.log(`Column: ${columnName}, Category: ${categoryCapitalized}`);
    
    const pool = getPool();
    
    // Step 1: Fetch ALL items from epc_item_list based on selected category ONLY
    const [allItems] = await pool.execute(
      `SELECT DISTINCT itemCode, itemDescription, itemCategory 
       FROM epc_item_list 
       WHERE itemCategory = ?
       ORDER BY itemCode ASC`,
      [categoryCapitalized]
    );
    
    console.log(`Found ${allItems.length} total items in epc_item_list for category '${categoryCapitalized}'`);
    console.log(`Items: ${allItems.map(i => i.itemCode).join(', ')}`);
    console.log(`============================\n`);
    
    res.json({
      items: allItems
    });
    
  } catch (err) {
    console.error('GET /filters/items-for-assignment error:', err);
    res.status(500).json({ error: 'Failed to fetch items for assignment' });
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

    // Validate category and get the column name for epc_stores table
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
    
    // Get all stores from epc_stores where:
    // 1. chainCode matches the selected chain (e.g., 'vChain')
    // 2. The category column (e.g., lampsClass) is NULL, 'NA', or NOT equal to storeClass
    const query = `
      SELECT b.storeCode, b.storeName, b.chainCode, b.${categoryColumn}
      FROM epc_stores b
      WHERE b.chainCode = ? 
        AND (b.${categoryColumn} IS NULL OR b.${categoryColumn} = 'NA' OR b.${categoryColumn} != ?)
      ORDER BY b.storeCode ASC
    `;

    const [rows] = await pool.execute(query, [chainValue, storeClassValue]);
    
    res.json({
      items: rows.map(r => ({
        branchCode: r.storeCode,
        branchName: r.storeName,
        chainCode: r.chainCode,
        storeClass: r[categoryColumn]
      }))
    });
  } catch (err) {
    console.error('GET /filters/available-branches error:', err);
    res.status(500).json({ error: 'Failed to fetch available branches' });
  }
});

// ============================================================================
// NBFI-SPECIFIC ENDPOINTS
// ============================================================================

// GET /api/filters/nbfi/categories (or brands)
router.get('/nbfi/categories', async (req, res) => {
  try {
    const pool = getPool();
    // Try nbfi_categories first, fallback to nbfi_brands
    let rows;
    try {
      [rows] = await pool.execute(
        'SELECT id, catCode, category FROM nbfi_categories ORDER BY category ASC'
      );
    } catch (err) {
      // If nbfi_categories doesn't exist, try nbfi_brands
      if (err.code === 'ER_NO_SUCH_TABLE') {
        [rows] = await pool.execute(
          'SELECT id, brandCode AS catCode, brand AS category FROM nbfi_brands ORDER BY brand ASC'
        );
      } else {
        throw err;
      }
    }
    res.json({ items: rows.map(r => ({ id: r.id, catCode: r.catCode, category: r.category })) });
  } catch (err) {
    console.error('GET /filters/nbfi/categories error:', err);
    res.status(500).json({ error: 'Failed to fetch NBFI categories' });
  }
});

// GET /api/filters/nbfi/store-classes
router.get('/nbfi/store-classes', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, storeClassCode, storeClassification FROM nbfi_store_class ORDER BY storeClassification ASC'
    );
    res.json({ items: rows.map(r => ({ id: r.id, storeClassCode: r.storeClassCode, storeClassification: r.storeClassification })) });
  } catch (err) {
    console.error('GET /filters/nbfi/store-classes error:', err);
    res.status(500).json({ error: 'Failed to fetch NBFI store classes' });
  }
});

// GET /api/filters/nbfi/chains
router.get('/nbfi/chains', async (req, res) => {
  try {
    const pool = getPool();
    try {
      const [rows] = await pool.execute('SELECT id, chainCode, chainName FROM nbfi_chains ORDER BY chainName ASC');
      if (rows && rows.length > 0) {
        return res.json({ items: rows.map(r => ({ id: r.id, chainCode: r.chainCode, chainName: r.chainName })) });
      }
    } catch (err) {
      // If table not found, fall through to derive from stores
      if (!err || err.code !== 'ER_NO_SUCH_TABLE') {
        console.error('GET /filters/nbfi/chains (chains table) error:', err);
        return res.status(500).json({ error: 'Failed to fetch NBFI chains' });
      }
    }
    // Fallback: derive distinct chain codes from nbfi_stores
    const [rows2] = await pool.execute('SELECT DISTINCT chainCode FROM nbfi_stores ORDER BY chainCode ASC');
    res.json({ items: rows2.map(r => ({ id: null, chainCode: r.chainCode, chainName: r.chainCode })) });
  } catch (err) {
    console.error('GET /filters/nbfi/chains error:', err);
    res.status(500).json({ error: 'Failed to fetch NBFI chains' });
  }
});

// GET /api/filters/nbfi/stores (stores)
router.get('/nbfi/stores', async (req, res) => {
  try {
    let { chain, storeClass, category } = req.query;
    if (!chain || !storeClass || !category) {
      return res.status(400).json({ error: 'Missing required parameters: chain, storeClass, and category are required' });
    }

    chain = String(chain).trim();
    storeClass = String(storeClass).trim();
    category = String(category).trim().toUpperCase();

    console.log('GET /filters/nbfi/stores', { chain, storeClass, category });

    // Build brand column name from category (brand code)
    const sanitize = (s) => String(s || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
    const brandCol = `brand_${sanitize(category)}`;

    const pool = getPool();

    // Prefer checking brand column on `nbfi_stores` (we no longer rely on nbfi_store_exclusivity_list)
    const [colInfo] = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`,
      [brandCol]
    );

    if (!Array.isArray(colInfo) || colInfo.length === 0) {
      return res.status(400).json({ error: `Invalid brand '${category}' or brand column not found in nbfi_stores` });
    }

    const dataType = (colInfo[0].DATA_TYPE || '').toLowerCase();

    // Detect whether nbfi_stores has a storeClassification column (it may not)
    const [scCol] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = 'storeClassification'`
    );
    const hasStoreClassification = Array.isArray(scCol) && scCol.length > 0;

    // Build SQL depending on column type and whether storeClassification exists
    let query;
    let params;
    const numericTypes = new Set(['tinyint', 'int', 'smallint', 'mediumint', 'bigint', 'bit', 'boolean']);

    if (numericTypes.has(dataType)) {
      // numeric flag: check the brand flag directly on nbfi_stores
      if (hasStoreClassification) {
        query = `
          SELECT DISTINCT s.storeCode, s.storeName, s.chainCode, s.storeClassification
          FROM nbfi_stores s
          WHERE s.chainCode = ?
            AND s.\`${brandCol}\` = 1
            AND s.storeClassification = ?
          ORDER BY s.storeCode ASC
        `;
        params = [chain, storeClass];
      } else {
        // If storeClassification column is missing, omit that filter and return NULL for classification
        query = `
          SELECT DISTINCT s.storeCode, s.storeName, s.chainCode, NULL AS storeClassification
          FROM nbfi_stores s
          WHERE s.chainCode = ?
            AND s.\`${brandCol}\` = 1
          ORDER BY s.storeCode ASC
        `;
        params = [chain];
      }
    } else {
      // text column: expect the column to contain the storeClass code (e.g. 'ASEH')
      if (hasStoreClassification) {
        query = `
          SELECT DISTINCT s.storeCode, s.storeName, s.chainCode, s.storeClassification
          FROM nbfi_stores s
          WHERE s.chainCode = ?
            AND (s.\`${brandCol}\` = ? OR s.\`${brandCol}\` = '1')
            AND (s.storeClassification = ? OR s.storeClassification IS NULL)
          ORDER BY s.storeCode ASC
        `;
        params = [chain, storeClass, storeClass];
      } else {
        query = `
          SELECT DISTINCT s.storeCode, s.storeName, s.chainCode, NULL AS storeClassification
          FROM nbfi_stores s
          WHERE s.chainCode = ?
            AND (s.\`${brandCol}\` = ? OR s.\`${brandCol}\` = '1')
          ORDER BY s.storeCode ASC
        `;
        params = [chain, storeClass];
      }
    }

    const [rows] = await pool.execute(query, params);

    // Determine table based on chain parameter
    const chainUpper = String(chain).trim().toUpperCase();
    const allowedChains = ['SM', 'RDS', 'WDS'];
    const tableName = allowedChains.includes(chainUpper) 
      ? `nbfi_${chainUpper.toLowerCase()}_item_exclusivity_list`
      : 'nbfi_sm_item_exclusivity_list'; // fallback to SM

    // Verify table exists
    const [tableCheck] = await pool.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName]
    );
    
    if (!Array.isArray(tableCheck) || tableCheck.length === 0) {
      return res.status(500).json({ error: `Table ${tableName} not found` });
    }

    // Get excluded items for each branch from the chain-specific exclusivity table
    // The exclusivity list now contains per-item flags for store classes: ASEH, BSH, CSM, DSS, ESES.
    const allowedTypes = ['ASEH', 'BSH', 'CSM', 'DSS', 'ESES'];
    const branchesWithExclusions = await Promise.all(rows.map(async (branch) => {
      // Determine store type column to check using storeClass parameter or storeClassification from row
      let storeType = (branch.storeClassification || storeClass || '') + '';
      storeType = String(storeType).trim().toUpperCase();
      if (!allowedTypes.includes(storeType)) {
        // fallback heuristic: prefer 'ASEH' as default
        storeType = 'ASEH';
      }

      // Ensure column exists in the chain-specific table
      const [colCheck] = await pool.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tableName, storeType]
      );
      if (!Array.isArray(colCheck) || colCheck.length === 0) {
        // If column missing, return empty exclusions for this branch (safe fallback)
        return {
          branchCode: branch.storeCode,
          branchName: branch.storeName,
          excludedItemIds: []
        };
      }

      const query = `SELECT itemCode FROM ${tableName} WHERE \`${storeType}\` = 1`;
      const [exclusions] = await pool.execute(query);

      return {
        branchCode: branch.storeCode,
        branchName: branch.storeName,
        excludedItemIds: Array.isArray(exclusions) ? exclusions.map(e => e.itemCode).filter(Boolean) : []
      };
    }));

    res.json({ items: branchesWithExclusions });
  } catch (err) {
    console.error('GET /filters/nbfi/stores error:', err);
    res.status(500).json({ error: 'Failed to fetch NBFI stores' });
  }
});

// GET /api/filters/nbfi/items
router.get('/nbfi/items', async (req, res) => {
  try {
    let { category } = req.query;
    if (!category) {
      return res.status(400).json({ error: 'Missing required parameter: category' });
    }

    category = String(category).trim();

    console.log('GET /filters/nbfi/items', { category });

    const pool = getPool();
    const query = `
      SELECT itemCode, itemDescription
      FROM nbfi_item_list
      WHERE LOWER(itemBrand) = LOWER(?)
      ORDER BY itemCode ASC
    `;
    const [rows] = await pool.execute(query, [category]);

    res.json({ items: rows.map(r => ({ itemCode: r.itemCode, itemDescription: r.itemDescription })) });
  } catch (err) {
    console.error('GET /filters/nbfi/items error:', err);
    res.status(500).json({ error: 'Failed to fetch NBFI items' });
  }
});

// GET /api/filters/nbfi/exclusivity-items - Fetch items with exclusivity based on chain, brand, and storeClass
router.get('/nbfi/exclusivity-items', async (req, res) => {
  try {
    let { chain, storeClass, category } = req.query;
    if (!chain || !storeClass || !category) {
      return res.status(400).json({ error: 'Missing required parameters: chain, storeClass, and category are required' });
    }

    chain = String(chain).trim().toUpperCase();
    storeClass = String(storeClass).trim().toUpperCase();
    const brand = String(category).trim();

    const allowedChains = ['SM', 'RDS', 'WDS'];
    const allowedStoreClasses = ['ASEH', 'BSH', 'CSM', 'DSS', 'ESES'];

    if (!allowedChains.includes(chain)) {
      return res.status(400).json({ error: `Invalid chain. Must be one of: ${allowedChains.join(', ')}` });
    }

    if (!allowedStoreClasses.includes(storeClass)) {
      return res.status(400).json({ error: `Invalid storeClass. Must be one of: ${allowedStoreClasses.join(', ')}` });
    }

    console.log('GET /filters/nbfi/exclusivity-items', { chain, storeClass, brand });

    const pool = getPool();
    const tableName = `nbfi_${chain.toLowerCase()}_item_exclusivity_list`;

    // Verify table exists
    const [tableCheck] = await pool.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName]
    );

    if (!Array.isArray(tableCheck) || tableCheck.length === 0) {
      return res.status(400).json({ error: `Table ${tableName} not found` });
    }

    // Fetch items from nbfi_item_list filtered by brand, then join with chain-specific exclusivity table
    const query = `
      SELECT DISTINCT i.itemCode, i.itemDescription, i.itemBrand
      FROM nbfi_item_list i
      INNER JOIN ${tableName} e ON i.itemCode = e.itemCode
      WHERE LOWER(i.itemBrand) = LOWER(?)
        AND e.\`${storeClass}\` = 1
      ORDER BY i.itemCode ASC
    `;

    const [rows] = await pool.execute(query, [brand]);

    res.json({
      items: rows.map(r => ({
        itemCode: r.itemCode,
        itemDescription: r.itemDescription,
        itemBrand: r.itemBrand,
        quantity: 0
      }))
    });
  } catch (err) {
    console.error('GET /filters/nbfi/exclusivity-items error:', err);
    res.status(500).json({ error: 'Failed to fetch NBFI exclusivity items' });
  }
});

// GET /api/filters/nbfi/items-for-assignment
router.get('/nbfi/items-for-assignment', async (req, res) => {
  try {
    let { chain, storeClass, category } = req.query;
    if (!chain || !storeClass || !category) {
      return res.status(400).json({ error: 'Missing required parameters: chain, storeClass, and category are required' });
    }

    chain = String(chain).trim().toUpperCase();
    storeClass = String(storeClass).trim().toUpperCase();
    const brand = String(category).trim();

    const allowedChains = ['SM', 'RDS', 'WDS'];
    const allowedStoreClasses = ['ASEH', 'BSH', 'CSM', 'DSS', 'ESES'];

    if (!allowedChains.includes(chain)) {
      return res.status(400).json({ error: `Invalid chain. Must be one of: ${allowedChains.join(', ')}` });
    }

    if (!allowedStoreClasses.includes(storeClass)) {
      return res.status(400).json({ error: `Invalid storeClass. Must be one of: ${allowedStoreClasses.join(', ')}` });
    }

    console.log('GET /filters/nbfi/items-for-assignment', { chain, storeClass, brand });

    const pool = getPool();
    const tableName = `nbfi_${chain.toLowerCase()}_item_exclusivity_list`;

    // Get available items (not assigned to this chain+storeClass combination)
    const query = `
      SELECT DISTINCT i.itemCode, i.itemDescription, i.itemBrand
      FROM nbfi_item_list i
      LEFT JOIN ${tableName} e ON i.itemCode = e.itemCode
      WHERE LOWER(i.itemBrand) = LOWER(?)
        AND (e.itemCode IS NULL OR e.\`${storeClass}\` IS NULL OR e.\`${storeClass}\` != 1)
      ORDER BY i.itemCode ASC
    `;

    const [rows] = await pool.execute(query, [brand]);

    res.json({
      items: rows.map(r => ({
        itemCode: r.itemCode,
        itemDescription: r.itemDescription,
        itemBrand: r.itemBrand
      }))
    });
  } catch (err) {
    console.error('GET /filters/nbfi/items-for-assignment error:', err);
    res.status(500).json({ error: 'Failed to fetch NBFI items for assignment' });
  }
});

// GET /api/filters/nbfi/available-stores
router.get('/nbfi/available-stores', async (req, res) => {
  try {
    let { chain, category } = req.query;
    if (!chain || !category) {
      return res.status(400).json({ error: 'Missing required parameters: chain and category are required' });
    }

    chain = String(chain).trim();
    category = String(category).trim().toLowerCase();

    const validColumns = {
      'lamps': 'lampsClass',
      'decors': 'decorsClass',
      'clocks': 'clocksClass',
      'stationery': 'stationeryClass',
      'frames': 'framesClass'
    };

    const categoryColumn = validColumns[category];
    if (!categoryColumn) {
      return res.status(400).json({ error: `Invalid category. Must be one of: ${Object.keys(validColumns).join(', ')}` });
    }

    console.log('GET /filters/nbfi/available-stores', { chain, category });

    const pool = getPool();
    const query = `
      SELECT storeCode, storeName, chainCode, ${categoryColumn} as storeClass
      FROM nbfi_stores
      WHERE chainCode = ? AND ${categoryColumn} IS NOT NULL AND ${categoryColumn} != ''
      ORDER BY storeCode ASC
    `;
    const [rows] = await pool.execute(query, [chain]);

    res.json({
      items: rows.map(r => ({
        branchCode: r.storeCode,
        branchName: r.storeName,
        chainCode: r.chainCode,
        storeClass: r.storeClass
      }))
    });
  } catch (err) {
    console.error('GET /filters/nbfi/available-stores error:', err);
    res.status(500).json({ error: 'Failed to fetch NBFI available stores' });
  }
});

module.exports = router;