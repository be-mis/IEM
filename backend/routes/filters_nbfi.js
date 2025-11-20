const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');
const mysql = require('mysql2');
// GET /api/filters/nbfi/modal-stores (exclusive for Add Store modal)
router.get('/nbfi/modal-stores', async (req, res) => {
  try {
    const { chain } = req.query;
    if (!chain) {
      return res.status(400).json({ error: 'Missing required parameter: chain' });
    }

    const pool = getPool();
    const query = `
      SELECT storeCode, storeName, chainCode
      FROM nbfi_stores
      WHERE chainCode = ?
      ORDER BY storeCode ASC
    `;
    const [rows] = await pool.execute(query, [chain]);
    return res.json({ items: rows.map(r => ({
      branchCode: r.storeCode,
      branchName: r.storeName,
      chainCode: r.chainCode,
      storeClassCode: r.storeClassCode
    })) });
  } catch (err) {
    console.error('GET /filters/nbfi/modal-stores error:', err);
    res.status(500).json({ error: 'Failed to fetch modal nbfi stores' });
  }
});
// GET /api/filters/nbfi/all-stores
router.get('/nbfi/all-stores', async (req, res) => {
  try {
    const { chain } = req.query;
    if (!chain) {
      return res.status(400).json({ error: 'Missing required parameter: chain' });
    }

    const pool = getPool();
    const query = `
      SELECT storeCode, storeName, chainCode
      FROM nbfi_stores
      WHERE chainCode = ?
      ORDER BY storeCode ASC
    `;
    const [rows] = await pool.execute(query, [chain]);
    return res.json({ items: rows.map(r => ({ branchCode: r.storeCode, branchName: r.storeName, chainCode: r.chainCode })) });
  } catch (err) {
    console.error('GET /filters/nbfi/all-stores error:', err);
    res.status(500).json({ error: 'Failed to fetch all nbfi stores' });
  }
});

// GET /api/filters/nbfi/available-stores
router.get('/nbfi/available-stores', async (req, res) => {
  try {
    const { chain, brand, storeClass } = req.query;
    if (!chain || !brand || !storeClass) {
      return res.status(400).json({ error: 'Missing required parameters: chain, brand, and storeClass are all required.' });
    }

    const pool = getPool();
    console.log('GET /api/filters/nbfi/available-stores -> params:', { chain, brand, storeClass });

    // Use the brand-specific column on nbfi_stores
    const sanitize = (s) => String(s || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
    const brandCol = `brand_${sanitize(brand)}`;

    // Check if the brand column exists
    const [colInfo] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`,
      [brandCol]
    );
    if (!Array.isArray(colInfo) || colInfo.length === 0) {
      return res.status(400).json({ error: `Brand column not found for brand='${brand}' (expected column '${brandCol}').` });
    }

    // Only return stores for the chain where the brand column matches the requested storeClass
    const params = [chain, String(storeClass).trim()];
    const query = `
      SELECT s.storeCode, s.storeName, s.chainCode, s.\`${brandCol}\` AS storeClass
      FROM nbfi_stores s
      WHERE s.chainCode = ?
        AND s.\`${brandCol}\` IS NOT NULL AND s.\`${brandCol}\` != ''
        AND LOWER(s.\`${brandCol}\`) = LOWER(?)
      ORDER BY s.storeCode ASC
    `;

    console.log('Executing available-stores SQL (strict):', query.replace(/\s+/g, ' ').trim());
    const [rows] = await pool.execute(query, params);
    console.log(`Returned ${Array.isArray(rows) ? rows.length : 0} available stores for chain='${chain}' brand='${brand}' storeClass='${storeClass}'`);
    return res.json({ items: rows.map(r => ({ branchCode: r.storeCode, branchName: r.storeName, chainCode: r.chainCode, storeClass: r.storeClass })) });
  } catch (err) {
    console.error('GET /filters/nbfi/available-stores error:', err);
    res.status(500).json({ error: 'Failed to fetch nbfi available stores' });
  }
});


// GET /api/filters/nbfi/brands
router.get('/nbfi/brands', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, brandCode, brand FROM nbfi_brands ORDER BY brand ASC'
    );
    res.json({ items: rows.map(r => ({ id: r.id, brandCode: r.brandCode, brand: r.brand })) });
  } catch (err) {
    console.error('GET /filters/nbfi/brands error:', err);
    res.status(500).json({ error: 'Failed to fetch nbfi brands' });
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
    res.status(500).json({ error: 'Failed to fetch nbfi store classes' });
  }
});

// GET /api/filters/nbfi/chains
router.get('/nbfi/chains', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT id, chainCode, chainName FROM nbfi_chains ORDER BY chainName ASC');
    res.json({ items: rows.map(r => ({ id: r.id, chainCode: r.chainCode, chainName: r.chainName })) });
  } catch (err) {
    console.error('GET /filters/nbfi/chains error:', err);
    res.status(500).json({ error: 'Failed to fetch nbfi chains' });
  }
});

// GET /api/filters/nbfi/stores
router.get('/nbfi/stores', async (req, res) => {
  try {
    const { chain, brand, storeClass } = req.query;
    if (!chain || !brand || !storeClass) {
      return res.status(400).json({ error: 'Missing required parameters: chain, brand, and storeClass are all required.' });
    }

    const pool = getPool();
    console.log('GET /api/filters/nbfi/stores -> params:', { chain, brand, storeClass });

    // Use the brand-specific column on nbfi_stores
    const sanitize = (s) => String(s || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
    const brandCol = `brand_${sanitize(brand)}`;

    // Check if the brand column exists
    const [colInfo] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`,
      [brandCol]
    );
    if (!Array.isArray(colInfo) || colInfo.length === 0) {
      return res.status(400).json({ error: `Brand column not found for brand='${brand}' (expected column '${brandCol}').` });
    }

    // Only return stores for the chain where the brand column matches the requested storeClass
    const params = [chain, String(storeClass).trim()];
    const query = `
      SELECT s.storeCode, s.storeName, s.chainCode, s.\`${brandCol}\` AS storeClass
      FROM nbfi_stores s
      WHERE s.chainCode = ?
        AND s.\`${brandCol}\` IS NOT NULL AND s.\`${brandCol}\` != ''
        AND LOWER(s.\`${brandCol}\`) = LOWER(?)
      ORDER BY s.storeCode ASC
    `;

    console.log('Executing stores SQL (strict):', query.replace(/\s+/g, ' ').trim());
    const [rows] = await pool.execute(query, params);
    console.log(`Returned ${Array.isArray(rows) ? rows.length : 0} stores for chain='${chain}' brand='${brand}' storeClass='${storeClass}'`);
    return res.json({ items: rows.map(r => ({ branchCode: r.storeCode, branchName: r.storeName, chainCode: r.chainCode, storeClass: r.storeClass })) });
  } catch (err) {
    console.error('GET /filters/nbfi/stores error:', err);
    res.status(500).json({ error: 'Failed to fetch nbfi stores' });
  }
});

// GET /api/filters/nbfi/items
router.get('/nbfi/items', async (req, res) => {
  try {
    const { brand } = req.query;
    if (!brand) return res.status(400).json({ error: 'brand query param required' });
    const pool = getPool();
    // nbfi_item_list uses `itemBrand` column which holds the brandCode value
    const [rows] = await pool.execute('SELECT itemCode, itemDescription FROM nbfi_item_list WHERE itemBrand = ? ORDER BY itemCode ASC', [brand]);
    res.json({ items: rows.map(r => ({ itemCode: r.itemCode, itemDescription: r.itemDescription })) });
  } catch (err) {
    console.error('GET /filters/nbfi/items error:', err && err.message ? err.message : err);
    if (process.env.NODE_ENV !== 'production') return res.status(500).json({ error: 'Failed to fetch nbfi items', details: err && err.message ? err.message : String(err) });
    res.status(500).json({ error: 'Failed to fetch nbfi items' });
  }
});

// GET /api/filters/nbfi/exclusivity-items
router.get('/nbfi/exclusivity-items', async (req, res) => {
  try {
    const { chain, brand } = req.query;
    if (!chain || !brand) return res.status(400).json({ error: 'chain and brand required' });
    const pool = getPool();
    // NBfI exclusivity lists are stored per-chain in tables named like:
    // nbfi_sm_item_exclusivity_list, nbfi_rds_item_exclusivity_list, nbfi_wds_item_exclusivity_list
    const chainKey = String(chain).trim().toLowerCase();
    const tableMap = {
      'sm': 'nbfi_sm_item_exclusivity_list',
      'rds': 'nbfi_rds_item_exclusivity_list',
      'wds': 'nbfi_wds_item_exclusivity_list'
    };
    const tableName = tableMap[chainKey];
    if (!tableName) {
      return res.status(400).json({ error: `Unsupported chain: ${chain}` });
    }

    // Ensure the exclusivity table exists by attempting a simple DESCRIBE
    try {
      await pool.execute(`DESCRIBE \`${tableName}\``);
    } catch (e) {
      console.error('Exclusivity table missing:', tableName, e && e.message ? e.message : e);
      return res.json({ items: [] });
    }

    // Return items that belong to the brand and exist in the chain's exclusivity table
    const query = `
      SELECT i.itemCode, i.itemDescription
      FROM nbfi_item_list i
      INNER JOIN ${tableName} e ON e.itemCode = i.itemCode
      WHERE i.itemBrand = ?
      ORDER BY i.itemCode ASC
    `;
    const [rows] = await pool.execute(query, [brand]);
    res.json({ items: rows.map(r => ({ itemCode: r.itemCode, itemDescription: r.itemDescription })) });
  } catch (err) {
    console.error('GET /filters/nbfi/exclusivity-items error:', err && err.message ? err.message : err);
    if (process.env.NODE_ENV !== 'production') return res.status(500).json({ error: 'Failed to fetch nbfi exclusivity items', details: err && err.message ? err.message : String(err) });
    res.status(500).json({ error: 'Failed to fetch nbfi exclusivity items' });
  }
});

module.exports = router;

// GET /api/filters/nbfi/items-with-exclusivity
// Returns items for a brand and a boolean flag whether the item is in exclusivity for the given chain
router.get('/nbfi/items-with-exclusivity', async (req, res) => {
  try {
    const { chain, brand } = req.query;
    if (!chain || !brand) return res.status(400).json({ error: 'chain and brand required' });

    const pool = getPool();
    const chainKey = String(chain).trim().toLowerCase();
    const tableMap = {
      'sm': 'nbfi_sm_item_exclusivity_list',
      'rds': 'nbfi_rds_item_exclusivity_list',
      'wds': 'nbfi_wds_item_exclusivity_list'
    };
    const tableName = tableMap[chainKey];
    if (!tableName) return res.status(400).json({ error: `Unsupported chain: ${chain}` });

    // Ensure table exists
    try {
      await pool.execute(`DESCRIBE \`${tableName}\``);
    } catch (e) {
      console.error('Missing exclusivity table:', tableName, e && e.message ? e.message : e);
      return res.json({ items: [] });
    }

    // If storeClass is provided, return only items that are marked (==1) for that store class
    const { storeClass } = req.query;
    const allowedStoreClasses = ['ASEH', 'BSH', 'CSM', 'DSS', 'ESES'];

    // Debug logs for tracing which table and query are executed
    console.log('GET /api/filters/nbfi/items-with-exclusivity -> params:', { chain, brand, storeClass });
    console.log('Resolved exclusivity table:', tableName);

    if (storeClass && allowedStoreClasses.includes(String(storeClass).toUpperCase())) {
      const sc = String(storeClass).toUpperCase();
      // Compute inExclusivity using the specific storeClass column: true if that column == 1, else false.
      // Use LEFT JOIN so items without an exclusivity row are included and considered not exclusive.
      const q = `
        SELECT i.itemCode, i.itemDescription,
          CASE WHEN COALESCE(e.${sc}, 0) = 1 THEN 1 ELSE 0 END AS inExclusivity
        FROM nbfi_item_list i
        LEFT JOIN ${tableName} e ON e.itemCode = i.itemCode
        WHERE i.itemBrand = ?
        ORDER BY i.itemCode ASC
      `;
      console.log('Executing SQL (paramized):', q.replace(/\s+/g, ' ').trim(), '[brand => %s]');
      const [rows] = await pool.execute(q, [brand]);
      console.log(`Query returned ${Array.isArray(rows) ? rows.length : 0} rows for brand='${brand}' on chain='${chain}' storeClass='${sc}'`);
      return res.json({ items: rows.map(r => ({ itemCode: r.itemCode, itemDescription: r.itemDescription, inExclusivity: !!r.inExclusivity })) });
    }

    // No specific storeClass requested: fall back to previous behavior (inExclusivity across any storeclass)
    const query = `
      SELECT i.itemCode, i.itemDescription,
        CASE WHEN (COALESCE(e.ASEH,0)=1 OR COALESCE(e.BSH,0)=1 OR COALESCE(e.CSM,0)=1 OR COALESCE(e.DSS,0)=1 OR COALESCE(e.ESES,0)=1) THEN 1 ELSE 0 END AS inExclusivity
      FROM nbfi_item_list i
      LEFT JOIN ${tableName} e ON e.itemCode = i.itemCode
      WHERE i.itemBrand = ?
      ORDER BY i.itemCode ASC
    `;
    console.log('Executing SQL (paramized):', query.replace(/\s+/g, ' ').trim(), '[brand => %s]');
    const [rows] = await pool.execute(query, [brand]);
    console.log(`Query returned ${Array.isArray(rows) ? rows.length : 0} rows for brand='${brand}' on chain='${chain}'`);
    res.json({ items: rows.map(r => ({ itemCode: r.itemCode, itemDescription: r.itemDescription, inExclusivity: !!r.inExclusivity })) });
  } catch (err) {
    console.error('GET /filters/nbfi/items-with-exclusivity error:', err && err.message ? err.message : err);
    if (process.env.NODE_ENV !== 'production') return res.status(500).json({ error: 'Failed to fetch items-with-exclusivity', details: err && err.message ? err.message : String(err) });
    res.status(500).json({ error: 'Failed to fetch items-with-exclusivity' });
  }
});

// GET /api/filters/nbfi/items-for-assignment
// Returns NBfI items for assignment (not already assigned to the given chain+storeClass)
router.get('/nbfi/items-for-assignment', async (req, res) => {
  try {
    let { chain, storeClass, brand } = req.query;
    if (!chain || !storeClass || !brand) {
      return res.status(400).json({ error: 'Missing required parameters: chain, storeClass, and brand are required' });
    }

    chain = String(chain).trim().toUpperCase();
    storeClass = String(storeClass).trim().toUpperCase();
    brand = String(brand).trim();

    const allowedChains = ['SM', 'RDS', 'WDS'];
    const allowedStoreClasses = ['ASEH', 'BSH', 'CSM', 'DSS', 'ESES'];

    if (!allowedChains.includes(chain)) {
      return res.status(400).json({ error: `Invalid chain. Must be one of: ${allowedChains.join(', ')}` });
    }

    if (!allowedStoreClasses.includes(storeClass)) {
      return res.status(400).json({ error: `Invalid storeClass. Must be one of: ${allowedStoreClasses.join(', ')}` });
    }

    const pool = getPool();
    const tableName = `nbfi_${chain.toLowerCase()}_item_exclusivity_list`;

    // Get available items (not assigned to this chain+storeClass combination)
      // Build the query safely using validated storeClass (allowedStoreClasses checked above)
      const query =
        'SELECT DISTINCT i.itemCode, i.itemDescription, i.itemBrand' +
        ' FROM nbfi_item_list i' +
        ' LEFT JOIN ' + tableName + ' e ON i.itemCode = e.itemCode' +
        ' WHERE LOWER(i.itemBrand) = LOWER(?)' +
        ' AND (e.itemCode IS NULL OR e.' + storeClass + ' IS NULL OR e.' + storeClass + ' != 1)' +
        ' ORDER BY i.itemCode ASC';

    const [rows] = await pool.execute(query, [brand]);

    res.json({
      items: rows.map(r => ({
        itemCode: r.itemCode,
        itemDescription: r.itemDescription,
        itemBrand: r.itemBrand
      }))
    });
  } catch (err) {
    console.error('GET /filters/nbfi/items-for-assignment error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Failed to fetch NBFI items for assignment' });
  }
});
