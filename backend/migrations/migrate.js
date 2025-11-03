/**
 * Database Migration Runner
 * 
 * This script manages database schema migrations
 * Usage:
 *   npm run migrate          - Run all pending migrations
 *   npm run migrate:down     - Rollback last migration
 *   npm run migrate:reset    - Rollback all migrations
 *   npm run migrate:fresh    - Drop all tables and re-run migrations
 */

const fs = require('fs').promises;
const path = require('path');
const { connectDatabase, getPool } = require('../config/database');

// Migration tracking table
const createMigrationsTable = async (pool) => {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT(11) NOT NULL AUTO_INCREMENT,
      migration VARCHAR(255) NOT NULL,
      batch INT(11) NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
};

// Get all migration files
const getMigrationFiles = async () => {
  const migrationsDir = __dirname;
  const files = await fs.readdir(migrationsDir);
  
  return files
    .filter(file => file.endsWith('.js') && file !== 'migrate.js')
    .sort(); // Ensures migrations run in order
};

// Get executed migrations from database
const getExecutedMigrations = async (pool) => {
  const [rows] = await pool.execute(
    'SELECT migration FROM migrations ORDER BY id'
  );
  return rows.map(row => row.migration);
};

// Get current batch number
const getCurrentBatch = async (pool) => {
  const [rows] = await pool.execute(
    'SELECT MAX(batch) as maxBatch FROM migrations'
  );
  return (rows[0].maxBatch || 0) + 1;
};

// Run migrations (up)
const runMigrations = async () => {
  try {
    console.log('🚀 Starting migration process...\n');
    
    // Connect to database
    await connectDatabase();
    const pool = getPool();
    
    // Ensure migrations table exists
    await createMigrationsTable(pool);
    
    // Get migration files and executed migrations
    const migrationFiles = await getMigrationFiles();
    const executedMigrations = await getExecutedMigrations(pool);
    
    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !executedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations. Database is up to date.\n');
      return;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migration(s):\n`);
    pendingMigrations.forEach(file => console.log(`   - ${file}`));
    console.log('');
    
    // Get current batch
    const batch = await getCurrentBatch(pool);
    
    // Run each pending migration
    for (const file of pendingMigrations) {
      try {
        const migrationPath = path.join(__dirname, file);
        const migration = require(migrationPath);
        
        console.log(`⏳ Running: ${file}`);
        await migration.up(pool);
        
        // Record migration
        await pool.execute(
          'INSERT INTO migrations (migration, batch) VALUES (?, ?)',
          [file, batch]
        );
        
        console.log(`✅ Completed: ${file}\n`);
      } catch (error) {
        console.error(`❌ Failed: ${file}`);
        console.error(`Error: ${error.message}\n`);
        throw error;
      }
    }
    
    console.log('🎉 All migrations completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Rollback last batch (down)
const rollbackMigrations = async () => {
  try {
    console.log('🔄 Starting rollback process...\n');
    
    // Connect to database
    await connectDatabase();
    const pool = getPool();
    
    // Ensure migrations table exists
    await createMigrationsTable(pool);
    
    // Get last batch number
    const [batchRows] = await pool.execute(
      'SELECT MAX(batch) as maxBatch FROM migrations'
    );
    const lastBatch = batchRows[0].maxBatch;
    
    if (!lastBatch) {
      console.log('✅ No migrations to rollback.\n');
      return;
    }
    
    // Get migrations from last batch
    const [migrations] = await pool.execute(
      'SELECT migration FROM migrations WHERE batch = ? ORDER BY id DESC',
      [lastBatch]
    );
    
    if (migrations.length === 0) {
      console.log('✅ No migrations to rollback.\n');
      return;
    }
    
    console.log(`📋 Rolling back batch ${lastBatch} (${migrations.length} migration(s)):\n`);
    migrations.forEach(row => console.log(`   - ${row.migration}`));
    console.log('');
    
    // Rollback each migration
    for (const row of migrations) {
      try {
        const migrationPath = path.join(__dirname, row.migration);
        const migration = require(migrationPath);
        
        console.log(`⏳ Rolling back: ${row.migration}`);
        await migration.down(pool);
        
        // Remove migration record
        await pool.execute(
          'DELETE FROM migrations WHERE migration = ?',
          [row.migration]
        );
        
        console.log(`✅ Rolled back: ${row.migration}\n`);
      } catch (error) {
        console.error(`❌ Failed to rollback: ${row.migration}`);
        console.error(`Error: ${error.message}\n`);
        throw error;
      }
    }
    
    console.log('🎉 Rollback completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Reset all migrations
const resetMigrations = async () => {
  try {
    console.log('🔄 Starting reset process (rolling back ALL migrations)...\n');
    
    // Connect to database
    await connectDatabase();
    const pool = getPool();
    
    // Ensure migrations table exists
    await createMigrationsTable(pool);
    
    // Get all migrations in reverse order
    const [migrations] = await pool.execute(
      'SELECT migration FROM migrations ORDER BY id DESC'
    );
    
    if (migrations.length === 0) {
      console.log('✅ No migrations to reset.\n');
      return;
    }
    
    console.log(`📋 Rolling back ${migrations.length} migration(s):\n`);
    migrations.forEach(row => console.log(`   - ${row.migration}`));
    console.log('');
    
    // Rollback each migration
    for (const row of migrations) {
      try {
        const migrationPath = path.join(__dirname, row.migration);
        const migration = require(migrationPath);
        
        console.log(`⏳ Rolling back: ${row.migration}`);
        await migration.down(pool);
        
        // Remove migration record
        await pool.execute(
          'DELETE FROM migrations WHERE migration = ?',
          [row.migration]
        );
        
        console.log(`✅ Rolled back: ${row.migration}\n`);
      } catch (error) {
        console.error(`❌ Failed to rollback: ${row.migration}`);
        console.error(`Error: ${error.message}\n`);
        throw error;
      }
    }
    
    console.log('🎉 Reset completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Reset failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

// Fresh migrations (reset + migrate)
const freshMigrations = async () => {
  console.log('🔄 Starting fresh migration (reset + migrate)...\n');
  await resetMigrations();
  await runMigrations();
};

// Parse command line arguments
const command = process.argv[2] || 'up';

switch (command) {
  case 'up':
    runMigrations();
    break;
  case 'down':
    rollbackMigrations();
    break;
  case 'reset':
    resetMigrations();
    break;
  case 'fresh':
    freshMigrations();
    break;
  default:
    console.log('Usage:');
    console.log('  npm run migrate          - Run all pending migrations');
    console.log('  npm run migrate:down     - Rollback last migration batch');
    console.log('  npm run migrate:reset    - Rollback all migrations');
    console.log('  npm run migrate:fresh    - Reset and re-run all migrations');
    process.exit(1);
}
