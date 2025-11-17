const { connectDatabase, getPool } = require('./config/database');

(async () => {
  await connectDatabase();
  const pool = getPool();
  
  const chain = 'SM';
  const brand = 'ANGELFISH';
  const storeClass = 'ASEH'; // A Stores - Extra High
  
  console.log('Searching for stores with:');
  console.log('Chain:', chain);
  console.log('Brand:', brand);
  console.log('Store Classification:', storeClass);
  console.log('');
  
  // We'll build the query after validating the brand column
  
  // Build brand column name
  const sanitize = (s) => String(s || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
  const brandCol = `brand_${sanitize(brand)}`;

  const [colCheck] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`, [brandCol]);
  if (!Array.isArray(colCheck) || colCheck.length === 0) {
    console.log(`Brand column ${brandCol} not found in nbfi_store_exclusivity_list`);
    process.exit(1);
  }

  // Rebuild query with brand column
  const finalQuery = `
    SELECT DISTINCT 
      s.storeCode AS branchCode, 
      s.storeName AS branchName,
      s.chainCode,
      e.storeClassification
    FROM nbfi_stores s
    INNER JOIN nbfi_store_exclusivity_list e ON s.storeCode = e.storeCode
    WHERE s.chainCode = ?
      AND e.\`${brandCol}\` = 1
      AND e.storeClassification = ?
    ORDER BY s.storeCode ASC
  `;

  const [rows] = await pool.execute(finalQuery, [chain, storeClass]);
  
  console.log(`Found ${rows.length} stores:\n`);
  
  if (rows.length > 0) {
    console.log('Branch Code         | Branch Name');
    console.log('-------------------|------------------------------------------');
    rows.forEach(row => {
      console.log(`${row.branchCode.padEnd(19)}| ${row.branchName}`);
    });
  } else {
    console.log('No stores found with these criteria.');
    console.log('\nLet me check what data exists:');
    
    // Check stores with this chain
    const [chainStores] = await pool.execute(
      'SELECT COUNT(*) as count FROM nbfi_stores WHERE chainCode = ?', 
      [chain]
    );
    console.log(`Stores with chain "${chain}":`, chainStores[0].count);
    
    // Check store exclusivity records using new brand column
    const sanitize = (s) => String(s || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
    const brandCol = `brand_${sanitize(brand)}`;
    const [brandCountRows] = await pool.execute(
      `SELECT COUNT(*) as count FROM nbfi_store_exclusivity_list WHERE \`${brandCol}\` = 1`
    );
    console.log(`Store exclusivity records with brand "${brand}":`, brandCountRows[0].count);
    
    // Check store exclusivity records with this classification
    const [classStores] = await pool.execute(
      'SELECT COUNT(*) as count FROM nbfi_store_exclusivity_list WHERE storeClassification = ?', 
      [storeClass]
    );
    console.log(`Store exclusivity records with classification "${storeClass}":`, classStores[0].count);
    
    // Show sample data
    console.log('\nSample store exclusivity data:');
    const [sample] = await pool.execute(
      'SELECT * FROM nbfi_store_exclusivity_list LIMIT 5'
    );
    console.log(sample);
  }
  
  process.exit(0);
})();
