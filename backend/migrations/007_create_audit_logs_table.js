/**
 * Migration: Create audit_logs table
 * Created: 2025-11-03
 * Description: Adds a general-purpose audit logs table for tracking user actions
 * Notes: Uses LONGTEXT + JSON validation for details to support MariaDB 10.4
 */

const up = async (pool) => {
  console.log('📝 Running migration: 007_create_audit_logs_table');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT(11) NOT NULL AUTO_INCREMENT,
      entity_type VARCHAR(50) NOT NULL,
      entity_id VARCHAR(64) DEFAULT NULL,
      action VARCHAR(50) NOT NULL,
      entity_name VARCHAR(255) DEFAULT NULL,
      user_id INT(11) DEFAULT NULL,
      user_name VARCHAR(100) DEFAULT NULL,
      ip_address VARCHAR(45) DEFAULT NULL,
      details LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(details)),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_created_at (created_at),
      KEY idx_entity (entity_type, action)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);

  console.log('✅ Created audit_logs table');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 007_create_audit_logs_table');
  await pool.execute('DROP TABLE IF EXISTS audit_logs');
  console.log('✅ Dropped audit_logs table');
};

module.exports = { up, down };
