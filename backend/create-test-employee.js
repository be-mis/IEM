// create-test-employee.js - Create a test employee user
const { connectDatabase, getPool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function createTestEmployee() {
  try {
    // Connect to database first
    await connectDatabase();
    
    const pool = getPool();
    
    // Create test employee user
    const password = await bcrypt.hash('employee123', 10);
    
    await pool.execute(`
      INSERT INTO users (username, email, password, role, is_active)
      VALUES (?, ?, ?, ?, TRUE)
      ON DUPLICATE KEY UPDATE id=id
    `, ['employee', 'employee@iem.com', password, 'employee']);
    
    console.log('✅ Created test employee user:');
    console.log('   Username: employee');
    console.log('   Email: employee@iem.com');
    console.log('   Password: employee123');
    console.log('   Role: employee');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test employee:', error);
    process.exit(1);
  }
}

createTestEmployee();
