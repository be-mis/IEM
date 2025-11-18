// Migration: Rename nbfi_item_exclusivity_list to nbfi_sm_item_exclusivity_list

const { getPool } = require('../config/database');

exports.up = async function() {
  const pool = getPool();
  
  console.log('Renaming nbfi_item_exclusivity_list to nbfi_sm_item_exclusivity_list...');
  
  await pool.execute(`RENAME TABLE nbfi_item_exclusivity_list TO nbfi_sm_item_exclusivity_list`);
  
  console.log('✅ Table renamed successfully');
  console.log('✅ Migration 024 completed successfully');
};

exports.down = async function() {
  const pool = getPool();
  
  console.log('Reverting table rename...');
  
  await pool.execute(`RENAME TABLE nbfi_sm_item_exclusivity_list TO nbfi_item_exclusivity_list`);
  
  console.log('✅ Migration 024 rollback completed');
};
