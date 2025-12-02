const { getPool } = require('../config/database');

exports.up = async function() {
  const pool = getPool();
  console.log('Creating nbfi_gg_item_exclusivity_list (if not exists)...');
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS nbfi_gg_item_exclusivity_list LIKE nbfi_sm_item_exclusivity_list
  `);
  console.log('✅ Created nbfi_gg_item_exclusivity_list (or already existed)');
};

exports.down = async function() {
  const pool = getPool();
  console.log('Dropping nbfi_gg_item_exclusivity_list if it exists...');
  await pool.execute('DROP TABLE IF EXISTS nbfi_gg_item_exclusivity_list');
  console.log('✅ Dropped nbfi_gg_item_exclusivity_list');
};
