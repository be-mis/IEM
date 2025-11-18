const { connectDatabase, getPool, closeDatabase } = require('./config/database');

(async function main() {
  try {
    await connectDatabase();
    const pool = getPool();

    console.log('\nChecking columns in `nbfi_item_exclusivity_list` for SM, RDS, WDS...');
    const [cols] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'nbfi_item_exclusivity_list'
         AND COLUMN_NAME IN ('SM','RDS','WDS')`
    );
    const foundCols = Array.isArray(cols) ? cols.map(c => c.COLUMN_NAME) : [];
    console.log('Found columns:', foundCols.length ? foundCols.join(', ') : '(none)');

    console.log('\nChecking if legacy table `nbfi_item_exclusivity` exists...');
    const [tables] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity'`
    );
    const legacyExists = tables && tables[0] && tables[0].cnt > 0;
    console.log('Legacy table `nbfi_item_exclusivity` exists:', legacyExists);

    console.log('\nRow counts (if tables exist):');
    try {
      const [[{ cnt: listCount }]] = await pool.execute(
        `SELECT COUNT(*) as cnt FROM nbfi_item_exclusivity_list`
      );
      console.log('- nbfi_item_exclusivity_list rows:', listCount);
    } catch (e) {
      console.log('- nbfi_item_exclusivity_list: (table missing or error)');
    }

    try {
      const [[{ cnt: legacyCount }]] = await pool.execute(
        `SELECT COUNT(*) as cnt FROM nbfi_item_exclusivity`
      );
      console.log('- nbfi_item_exclusivity rows:', legacyCount);
    } catch (e) {
      console.log('- nbfi_item_exclusivity: (table missing or dropped)');
    }

    console.log('\nSample rows from `nbfi_item_exclusivity_list` (first 10):');
    try {
      const [sample] = await pool.execute(
        `SELECT itemCode, SM, RDS, WDS FROM nbfi_item_exclusivity_list LIMIT 10`
      );
      if (Array.isArray(sample) && sample.length > 0) {
        sample.forEach(r => console.log(r));
      } else {
        console.log('(no rows returned)');
      }
    } catch (e) {
      console.log('(cannot select sample rows - table may be missing)');
    }

    // Additional sanity: describe nbfi_stores and nbfi_store_exclusivity_list (if present)
    try {
      console.log('\n=== nbfi_stores structure (first 20 fields) ===');
      const [stores] = await pool.execute("DESCRIBE nbfi_stores");
      stores.slice(0, 20).forEach(r => console.log(r.Field, '-', r.Type));
    } catch (e) {
      console.log('nbfi_stores: (missing or cannot describe)');
    }

    try {
      console.log('\n=== nbfi_store_exclusivity_list structure (first 40 fields) ===');
      const [exclusivity] = await pool.execute("DESCRIBE nbfi_store_exclusivity_list");
      exclusivity.slice(0, 40).forEach(r => console.log(r.Field, '-', r.Type));
    } catch (e) {
      console.log('nbfi_store_exclusivity_list: (missing or cannot describe)');
    }

    console.log('\nDone.');
    await closeDatabase();
    process.exit(0);
  } catch (err) {
    console.error('Error running check:', err.message || err);
    try { await closeDatabase(); } catch (e) {}
    process.exit(1);
  }
})();
