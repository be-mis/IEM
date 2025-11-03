# Quick Start - Database Migrations

## 🚀 First Time Setup

1. **Ensure MySQL is running**
2. **Configure .env file** (if not already done):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=item_exclusivity
   DB_PORT=3306
   ```

3. **Run migrations**:
   ```bash
   cd backend
   npm run migrate
   ```

That's it! Your database is now set up with all tables and sample data.

## 📋 Common Commands

| Command | Description |
|---------|-------------|
| `npm run migrate` | Run all pending migrations |
| `npm run migrate:down` | Rollback last migration batch |
| `npm run migrate:reset` | Drop all tables |
| `npm run migrate:fresh` | Reset + re-run all migrations |

## ✅ What Gets Created

After running migrations, you'll have:

### Tables
- ✅ **epc_chains** (3 chains: vChain, sMH, oH)
- ✅ **epc_categories** (5 categories: Lamps, Decors, Clocks, Stationery, Frames)
- ✅ **epc_store_class** (5 classifications: ASEH, BSH, CSM, DSS, ESES)
- ✅ **epc_branches** (5 sample branches from LANDMARK)
- ✅ **epc_item_list** (20 sample items)
- ✅ **epc_item_exclusivity_list** (5 sample exclusivity records)
- ✅ **migrations** (tracks migration history)

### Sample Data Summary
- 🏢 **5 Branches**: THE LANDMARK DEPT STORE locations
- 🏷️ **5 Categories**: Product types
- ⛓️ **3 Chains**: Store chains
- 📦 **20 Items**: Sample products
- 🔒 **5 Exclusivity Records**: Sample exclusivity data

## 🔧 Development Workflow

### Making Changes

```bash
# 1. Reset database (drops all tables)
npm run migrate:reset

# 2. Re-run all migrations
npm run migrate

# Or use fresh (combines both)
npm run migrate:fresh
```

### Creating New Migration

1. Create file: `backend/migrations/007_your_change.js`
2. Use the template from README.md
3. Test: `npm run migrate:fresh`
4. Commit the new migration file

## 🐛 Troubleshooting

### "No pending migrations"
✅ Migrations already ran. Database is up to date.

### "Connection refused"
❌ MySQL not running or wrong credentials
- Check MySQL is running
- Verify .env configuration

### "Table already exists"
❌ Table exists from previous manual setup
- Run: `npm run migrate:fresh`

### Need fresh start
```bash
npm run migrate:fresh
```

## 📁 File Structure

```
backend/
├── migrations/
│   ├── migrate.js                 # Runner
│   ├── 001_create_epc_chains_table.js
│   ├── 002_create_epc_categories_table.js
│   ├── 003_create_epc_store_class_table.js
│   ├── 004_create_epc_branches_table.js
│   ├── 005_create_epc_item_list_table.js
│   ├── 006_create_epc_item_exclusivity_list_table.js
│   ├── README.md                  # Full documentation
│   └── QUICKSTART.md             # This file
```

## 🎯 Next Steps

1. ✅ Run migrations: `npm run migrate`
2. ✅ Start server: `npm run dev`
3. ✅ Test API endpoints
4. ✅ Verify frontend connection

## 💡 Pro Tips

- Always backup before `migrate:reset` in production
- Use `migrate:fresh` frequently during development
- Never modify executed migration files
- Create new migrations for schema changes

---

**Need more details?** See `README.md` in this directory.
