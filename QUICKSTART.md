# Quick Start Guide - IEM System

## 🚀 Get Started in 5 Minutes

### Step 1: Start MySQL/MariaDB
Open XAMPP Control Panel and start MySQL service.

### Step 2: Start Backend
```bash
cd backend
npm start
```

You should see:
```
✅ Database connected successfully
✅ Database initialized successfully
🚀 Server running on http://0.0.0.0:5000
```

### Step 3: Start Frontend
Open a new terminal:
```bash
cd frontend
npm start
```

Browser will automatically open to `http://localhost:3000`

### Step 4: Navigate the System
1. **Exclusivity Form** - View current assignments
2. **Item Maintenance** - Add/remove item exclusivity
3. **Branch Maintenance** - Manage branch assignments
4. **Reports** - Generate reports
5. **Audit Logs** - View system history

## 🎯 Common Tasks

### Add Items to Exclusivity
1. Click "Item Maintenance" in sidebar
2. Select: Chain → Category → Store Class
3. Choose item from dropdown
4. Click "Add to List"
5. Click "Save All"

### Add Branches
1. Click "Branch Maintenance" in sidebar
2. Select: Chain → Category → Store Class
3. Choose branch from dropdown
4. Click "Add to List"
5. Click "Save All"

### Generate Report
1. Click "Reports" in sidebar
2. Select filters
3. Click "Generate Report"
4. Export to Excel if needed

## 🔧 Troubleshooting

**Backend won't start?**
- Check if MySQL is running in XAMPP
- Verify port 5000 is available

**Frontend won't connect?**
- Ensure backend is running
- Check console for errors

**No data showing?**
- Run migrations: `cd backend && node migrations/migrate.js`
- Check database has data

## 📞 Need Help?
Check `README.md` for detailed documentation.
