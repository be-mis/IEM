// Migration: Add size and color columns to epc_item_list table
const { getPool } = require('../config/database');

async function up() {
  const pool = getPool();
  
  console.log('Adding size and color columns to epc_item_list...');
  
  await pool.execute(`
    ALTER TABLE epc_item_list 
    ADD COLUMN itemSize VARCHAR(20) NULL AFTER itemDescription,
    ADD COLUMN itemColor VARCHAR(30) NULL AFTER itemSize
  `);
  
  console.log('✓ Successfully added size and color columns to epc_item_list');
}

async function down() {
  const pool = getPool();
  
  console.log('Removing size and color columns from epc_item_list...');
  
  await pool.execute(`
    ALTER TABLE epc_item_list 
    DROP COLUMN itemSize,
    DROP COLUMN itemColor
  `);
  
  console.log('✓ Successfully removed size and color columns from epc_item_list');
}

module.exports = { up, down };
