// Migration: Create nbfi_rds_item_exclusivity_list and nbfi_wds_item_exclusivity_list
// Replicate the structure of nbfi_sm_item_exclusivity_list

const { getPool } = require('../config/database');

exports.up = async function() {
  const pool = getPool();
  
  console.log('Creating nbfi_rds_item_exclusivity_list and nbfi_wds_item_exclusivity_list...');
  
  // Create nbfi_rds_item_exclusivity_list
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS nbfi_rds_item_exclusivity_list LIKE nbfi_sm_item_exclusivity_list
  `);
  console.log('✅ Created nbfi_rds_item_exclusivity_list');
  
  // Create nbfi_wds_item_exclusivity_list
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS nbfi_wds_item_exclusivity_list LIKE nbfi_sm_item_exclusivity_list
  `);
  console.log('✅ Created nbfi_wds_item_exclusivity_list');
  
  console.log('✅ Migration 025 completed successfully');
};

exports.down = async function() {
  const pool = getPool();
  
  console.log('Dropping nbfi_rds_item_exclusivity_list and nbfi_wds_item_exclusivity_list...');
  
  await pool.execute('DROP TABLE IF EXISTS nbfi_rds_item_exclusivity_list');
  console.log('✅ Dropped nbfi_rds_item_exclusivity_list');
  
  await pool.execute('DROP TABLE IF EXISTS nbfi_wds_item_exclusivity_list');
  console.log('✅ Dropped nbfi_wds_item_exclusivity_list');
  
  console.log('✅ Migration 025 rollback completed');
};
