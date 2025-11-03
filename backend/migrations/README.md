# Database Migrations Guide

## Overview

This migration system provides a structured way to manage database schema changes for the IEM (Inventory & Exclusivity Management) system. Migrations are versioned and can be applied or rolled back in sequence.

## Directory Structure

```
backend/
├── migrations/
│   ├── migrate.js                              # Migration runner
│   ├── 001_create_epc_chains_table.js         # Chain lookup table
│   ├── 002_create_epc_categories_table.js     # Category lookup table
│   ├── 003_create_epc_store_class_table.js    # Store classification lookup
│   ├── 004_create_epc_branches_table.js       # Branches with dynamic columns
│   ├── 005_create_epc_item_list_table.js      # Master item list
│   ├── 006_create_epc_item_exclusivity_list_table.js  # Exclusivity matrix
│   └── README.md                               # This file
```

## Database Schema

### Tables Created

1. **epc_chains** - Chain information (vChain, sMH, oH)
2. **epc_categories** - Item categories (Lamps, Decors, Clocks, Stationery, Frames)
3. **epc_store_class** - Store classifications (ASEH, BSH, CSM, DSS, ESES)
4. **epc_branches** - Branch information with category-specific classifications
5. **epc_item_list** - Master list of all items
6. **epc_item_exclusivity_list** - Item exclusivity matrix (chain × store class)
7. **migrations** - Tracks executed migrations (auto-created)

## Commands

### Run All Pending Migrations

```bash
npm run migrate
```

This command:
- Creates the `migrations` table if it doesn't exist
- Checks which migrations have been executed
- Runs all pending migrations in sequence
- Records each migration in the `migrations` table

### Rollback Last Migration Batch

```bash
npm run migrate:down
```

This command:
- Rolls back the last batch of migrations
- Useful for undoing recent changes during development

### Reset All Migrations

```bash
npm run migrate:reset
```

This command:
- Rolls back ALL migrations
- Drops all tables created by migrations
- Useful for starting fresh

### Fresh Migration (Reset + Migrate)

```bash
npm run migrate:fresh
```

This command:
- Rolls back all migrations
- Re-runs all migrations from scratch
- Useful for resetting development database

## Creating New Migrations

### Migration File Template

Create a new file in `backend/migrations/` with format: `NNN_description.js`

```javascript
/**
 * Migration: Description of what this migration does
 * Created: YYYY-MM-DD
 * Description: Detailed description
 */

const up = async (pool) => {
  console.log('📝 Running migration: NNN_description');
  
  // Your migration code here
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS your_table (
      id INT(11) NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  
  console.log('✅ Migration completed: NNN_description');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: NNN_description');
  
  // Your rollback code here
  await pool.execute('DROP TABLE IF EXISTS your_table');
  
  console.log('✅ Rollback completed: NNN_description');
};

module.exports = { up, down };
```

### Naming Convention

- Use sequential numbers: `001_`, `002_`, `003_`, etc.
- Use descriptive names: `create_tablename_table.js`
- Use underscores for spaces
- Keep names concise but clear

### Best Practices

1. **Always test migrations**: Run `migrate:fresh` before committing
2. **Write rollback code**: Every `up()` should have corresponding `down()`
3. **Use IF NOT EXISTS**: Prevents errors if migration runs twice
4. **Use INSERT IGNORE**: For seeding data safely
5. **One migration per change**: Don't combine multiple schema changes
6. **Document complex migrations**: Add comments explaining the logic

## Migration Execution Order

Migrations run in alphabetical order based on filename:

1. `001_create_epc_chains_table.js`
2. `002_create_epc_categories_table.js`
3. `003_create_epc_store_class_table.js`
4. `004_create_epc_branches_table.js`
5. `005_create_epc_item_list_table.js`
6. `006_create_epc_item_exclusivity_list_table.js`

## Sample Data

Each migration includes sample data from the provided SQL dump:

- **5 branches** (LANDMARK stores)
- **5 categories** (Lamps, Decors, Clocks, Stationery, Frames)
- **3 chains** (Various Chain, SM Homeworld, Our Home)
- **5 store classes** (ASEH, BSH, CSM, DSS, ESES)
- **20 items** (various products)
- **5 exclusivity records** (sample exclusivity data)

## Database Connection

Migrations use the same database connection as the main application:

```javascript
// Configured in backend/config/database.js
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'item_exclusivity',
  port: parseInt(process.env.DB_PORT) || 3306
};
```

Make sure your `.env` file is properly configured:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=item_exclusivity
DB_PORT=3306
```

## Troubleshooting

### Migration Already Executed

If you see "No pending migrations", the migration has already run. To re-run:

```bash
npm run migrate:reset  # Rollback all
npm run migrate        # Re-run all
```

### Migration Failed

If a migration fails:

1. Check the error message
2. Fix the migration file
3. Rollback: `npm run migrate:down`
4. Re-run: `npm run migrate`

### Connection Refused

If you get connection errors:

1. Verify MySQL is running
2. Check `.env` configuration
3. Verify database credentials
4. Ensure database exists or can be created

### Table Already Exists

Migrations use `CREATE TABLE IF NOT EXISTS` to prevent errors, but if you're having issues:

```bash
npm run migrate:fresh  # Drop and recreate everything
```

## Production Deployment

For production deployments:

1. **Backup database first**
2. Run migrations in maintenance window
3. Test rollback procedure
4. Monitor migration execution
5. Verify data integrity after migration

```bash
# Production migration workflow
npm run migrate        # Apply pending migrations
# If issues occur:
npm run migrate:down   # Rollback last batch
```

## Integration with Server

The migration system is separate from the main server. Run migrations before starting the server:

```bash
# Development
npm run migrate        # Run migrations
npm run dev            # Start dev server

# Production
npm run migrate        # Run migrations
npm start              # Start production server
```

## Version Control

- All migration files are version controlled
- Never modify executed migrations
- Create new migrations for schema changes
- Keep migration history in git

## Further Reading

- [MySQL CREATE TABLE Documentation](https://dev.mysql.com/doc/refman/8.0/en/create-table.html)
- [Node.js MySQL2 Package](https://github.com/sidorares/node-mysql2)
- [Database Migration Best Practices](https://www.prisma.io/dataguide/types/relational/what-are-database-migrations)

---

**Last Updated**: 2025-11-03  
**Schema Version**: 1.0.0  
**Database**: item_exclusivity
