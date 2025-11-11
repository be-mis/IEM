/**
 * Migration: Add user_email column to audit_logs table
 * Created: 2025-11-11
 * Description: Adds user_email column to properly track user emails in audit logs
 */

const up = async (pool) => {
  console.log('📝 Running migration: 009_add_user_email_to_audit_logs');

  // Check if column already exists
  const [columns] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'audit_logs' 
      AND COLUMN_NAME = 'user_email'
  `);

  if (columns.length === 0) {
    await pool.execute(`
      ALTER TABLE audit_logs 
      ADD COLUMN user_email VARCHAR(255) DEFAULT NULL AFTER user_name
    `);
    console.log('✅ Added user_email column to audit_logs table');
  } else {
    console.log('⏭️  user_email column already exists, skipping');
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 009_add_user_email_to_audit_logs');
  
  const [columns] = await pool.execute(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'audit_logs' 
      AND COLUMN_NAME = 'user_email'
  `);

  if (columns.length > 0) {
    await pool.execute('ALTER TABLE audit_logs DROP COLUMN user_email');
    console.log('✅ Removed user_email column from audit_logs table');
  }
};

module.exports = { up, down };
