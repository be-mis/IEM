#!/usr/bin/env node
/**
 * Migration runner for IEM system
 * Usage: node migrations/migrate.js [up|down|reset|fresh]
 */

const fs = require('fs').promises;
const path = require('path');
const { connectDatabase, getPool } = require('../config/database');

async function ensureMigrationsTable(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      migration VARCHAR(255) NOT NULL UNIQUE,
      batch INT NOT NULL DEFAULT 1,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations(pool) {
  try {
    const [rows] = await pool.execute('SELECT migration FROM migrations ORDER BY id ASC');
    return rows.map(r => r.migration);
  } catch (err) {
    return [];
  }
}

async function recordMigration(pool, name) {
  // Get current batch number
  const [batchResult] = await pool.execute('SELECT COALESCE(MAX(batch), 0) + 1 as nextBatch FROM migrations');
  const batch = batchResult[0].nextBatch;
  await pool.execute('INSERT INTO migrations (migration, batch) VALUES (?, ?)', [name, batch]);
}

async function removeMigration(pool, name) {
  await pool.execute('DELETE FROM migrations WHERE migration = ?', [name]);
}

async function runMigrations(direction = 'up') {
  try {
    console.log(`\n🔧 Starting migration: ${direction}\n`);
    
    await connectDatabase();
    const pool = getPool();
    
    await ensureMigrationsTable(pool);
    const executed = await getExecutedMigrations(pool);
    
    // Get all migration files
    const migrationsDir = __dirname;
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.js') && f !== 'migrate.js')
      .sort();
    
    if (direction === 'up') {
      // Run pending migrations
      const pending = migrationFiles.filter(f => !executed.includes(f));
      
      if (pending.length === 0) {
        console.log('✅ No pending migrations\n');
        return;
      }
      
      console.log(`📋 Found ${pending.length} pending migration(s):\n`);
      pending.forEach(f => console.log(`   - ${f}`));
      console.log('');
      
      for (const file of pending) {
        console.log(`▶️  Running: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        
        if (typeof migration.up !== 'function') {
          console.error(`❌ Migration ${file} does not export an 'up' function`);
          process.exit(1);
        }
        
        await migration.up(pool);
        await recordMigration(pool, file);
        console.log(`✅ Completed: ${file}\n`);
      }
      
      console.log('🎉 All migrations completed successfully!\n');
      
    } else if (direction === 'down') {
      // Rollback last migration
      if (executed.length === 0) {
        console.log('✅ No migrations to rollback\n');
        return;
      }
      
      const lastMigration = executed[executed.length - 1];
      console.log(`▶️  Rolling back: ${lastMigration}`);
      
      const migration = require(path.join(migrationsDir, lastMigration));
      
      if (typeof migration.down !== 'function') {
        console.error(`❌ Migration ${lastMigration} does not export a 'down' function`);
        process.exit(1);
      }
      
      await migration.down(pool);
      await removeMigration(pool, lastMigration);
      console.log(`✅ Rolled back: ${lastMigration}\n`);
      
    } else if (direction === 'reset') {
      // Rollback all migrations
      if (executed.length === 0) {
        console.log('✅ No migrations to reset\n');
        return;
      }
      
      console.log(`📋 Rolling back ${executed.length} migration(s):\n`);
      executed.forEach(f => console.log(`   - ${f}`));
      console.log('');
      
      for (const file of executed.reverse()) {
        console.log(`▶️  Rolling back: ${file}`);
        const migration = require(path.join(migrationsDir, file));
        
        if (typeof migration.down !== 'function') {
          console.error(`❌ Migration ${file} does not export a 'down' function`);
          process.exit(1);
        }
        
        await migration.down(pool);
        await removeMigration(pool, file);
        console.log(`✅ Rolled back: ${file}\n`);
      }
      
      console.log('🎉 All migrations reset successfully!\n');
      
    } else if (direction === 'fresh') {
      // Reset and re-run all migrations
      console.log('🔄 Fresh migration (reset + re-run all)\n');
      await runMigrations('reset');
      await runMigrations('up');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Parse command line arguments
const direction = process.argv[2] || 'up';
const validDirections = ['up', 'down', 'reset', 'fresh'];

if (!validDirections.includes(direction)) {
  console.error(`Invalid direction: ${direction}`);
  console.error(`Valid options: ${validDirections.join(', ')}`);
  process.exit(1);
}

runMigrations(direction);
