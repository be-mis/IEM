// 010_create_default_admin.js
const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function up() {
  const pool = getPool();
  
  // Create default admin user
  const defaultPassword = await bcrypt.hash('admin123', 10);
  
  await pool.execute(`
    INSERT INTO users (username, email, password, role, is_active)
    VALUES (?, ?, ?, ?, TRUE)
    ON DUPLICATE KEY UPDATE id=id
  `, ['admin', 'admin@iem.com', defaultPassword, 'admin']);
  
  console.log('✓ Created default admin user (username: admin, password: admin123)');
  console.log('⚠️  IMPORTANT: Change the default admin password after first login!');
}

async function down() {
  const pool = getPool();
  await pool.execute("DELETE FROM users WHERE username = 'admin' AND email = 'admin@iem.com'");
  console.log('✓ Removed default admin user');
}

module.exports = { up, down };
