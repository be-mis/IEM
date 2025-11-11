// 012_add_business_unit_to_users.js
const { getPool } = require('../config/database');

async function up() {
  const pool = getPool();
  
  await pool.execute(`
    ALTER TABLE users 
    ADD COLUMN business_unit ENUM('NBFI', 'EPC') DEFAULT NULL AFTER role
  `);
  
  console.log('✅ Added business_unit column to users table');
}

async function down() {
  const pool = getPool();
  
  await pool.execute(`
    ALTER TABLE users 
    DROP COLUMN business_unit
  `);
  
  console.log('✅ Removed business_unit column from users table');
}

module.exports = { up, down };
