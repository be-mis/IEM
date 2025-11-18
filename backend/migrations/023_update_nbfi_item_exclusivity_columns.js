// Migration: Update nbfi_item_exclusivity_list columns
// Drop: SM, RDS, WDS
// Add: ASEH, BSH, CSM, DSS, ESES (all int(2))

const { getPool } = require('../config/database');

exports.up = async function() {
  const pool = getPool();
  
  console.log('Updating nbfi_item_exclusivity_list columns...');
  
  // Drop old columns
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN IF EXISTS SM`);
  console.log('✅ Dropped column: SM');
  
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN IF EXISTS RDS`);
  console.log('✅ Dropped column: RDS');
  
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN IF EXISTS WDS`);
  console.log('✅ Dropped column: WDS');
  
  // Add new columns
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN ASEH INT(2) DEFAULT NULL`);
  console.log('✅ Added column: ASEH');
  
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN BSH INT(2) DEFAULT NULL`);
  console.log('✅ Added column: BSH');
  
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN CSM INT(2) DEFAULT NULL`);
  console.log('✅ Added column: CSM');
  
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN DSS INT(2) DEFAULT NULL`);
  console.log('✅ Added column: DSS');
  
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN ESES INT(2) DEFAULT NULL`);
  console.log('✅ Added column: ESES');
  
  console.log('✅ Migration 023 completed successfully');
};

exports.down = async function() {
  const pool = getPool();
  
  console.log('Reverting nbfi_item_exclusivity_list columns...');
  
  // Drop new columns
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN IF EXISTS ASEH`);
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN IF EXISTS BSH`);
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN IF EXISTS CSM`);
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN IF EXISTS DSS`);
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN IF EXISTS ESES`);
  
  // Restore old columns
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN SM VARCHAR(10) DEFAULT NULL`);
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN RDS VARCHAR(10) DEFAULT NULL`);
  await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN WDS VARCHAR(10) DEFAULT NULL`);
  
  console.log('✅ Migration 023 rollback completed');
};
