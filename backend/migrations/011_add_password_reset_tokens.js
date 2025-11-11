const { getPool } = require('../config/database');

async function up() {
  const pool = getPool();
  
  await pool.execute(`
    ALTER TABLE users 
    ADD COLUMN reset_token VARCHAR(255) NULL,
    ADD COLUMN reset_token_expires DATETIME NULL,
    ADD INDEX idx_reset_token (reset_token)
  `);
  
  console.log('✅ Added password reset token columns to users table');
}

async function down() {
  const pool = getPool();
  
  await pool.execute(`
    ALTER TABLE users 
    DROP INDEX idx_reset_token,
    DROP COLUMN reset_token,
    DROP COLUMN reset_token_expires
  `);
  
  console.log('✅ Removed password reset token columns from users table');
}

module.exports = { up, down };
