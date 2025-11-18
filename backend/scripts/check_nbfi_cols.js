(async ()=>{
  try {
    const { connectDatabase, getPool } = require('../config/database');
    await connectDatabase();
    const pool = getPool();
    const brandCol = 'brand_umbro';

    const [stCols] = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`,
      [brandCol]
    );
    console.log('nbfi_stores brand col:', stCols);

    const [exCols] = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`,
      [brandCol]
    );
    console.log('nbfi_store_exclusivity_list brand col:', exCols);

    const [itemCols] = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity_list'`
    );
    console.log('nbfi_item_exclusivity_list columns (sample 30):', itemCols.slice(0,30).map(c=>({name:c.COLUMN_NAME,type:c.DATA_TYPE})));

    await pool.end();
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
