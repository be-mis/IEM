# IEM - Item Exclusivity Management System

A comprehensive web-based system for managing item and branch exclusivity across multiple store chains and classifications.

## 🚀 System Overview

The IEM system manages the exclusivity of items and branches across different store chains (Various, SM, Orocan) and classifications (ASEH, BSH, CSM, DSS, ESES) for various product categories (Lamps, Decors, Clocks, Stationery, Frames).

## 📋 Features

### Core Modules
1. **Exclusivity Form** - Main interface for viewing and managing exclusivity assignments
2. **Item Maintenance** - Add, edit, and remove item exclusivity assignments
3. **Branch Maintenance** - Manage branch assignments by store classification
4. **Reports** - Generate exclusivity reports
5. **Audit Logs** - Track all system changes and user actions

### Key Capabilities
- ✅ Dynamic filtering by chain, category, and store classification
- ✅ Bulk operations for items and branches
- ✅ Real-time data validation
- ✅ Comprehensive audit logging
- ✅ Excel export functionality
- ✅ Responsive Material-UI design

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Material-UI 5** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL/MariaDB** - Database
- **mysql2** - Database driver

## 📁 Project Structure

```
IEM/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js           # Main dashboard with navigation
│   │   │   ├── ExclusivityForm.js     # Main exclusivity view
│   │   │   ├── ItemMaintenance.js     # Item management
│   │   │   ├── StoreMaintenance.js    # Branch management
│   │   │   ├── Filter.js              # Reusable filter component
│   │   │   ├── Reports.js             # Reporting interface
│   │   │   ├── AuditLogs.js           # Audit trail viewer
│   │   │   └── [other components]
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── config/
│   │   └── database.js                # Database configuration
│   ├── routes/
│   │   ├── inventory.js               # Item/branch operations
│   │   ├── filters.js                 # Filter data endpoints
│   │   ├── dashboard.js               # Dashboard data
│   │   ├── reports.js                 # Report generation
│   │   └── audit.js                   # Audit log endpoints
│   ├── utils/
│   │   ├── auditLogger.js             # Audit logging utility
│   │   └── logger.js                  # General logging
│   ├── migrations/                    # Database migrations
│   ├── server.js                      # Express server
│   └── package.json
│
└── docs/                              # Documentation files
    ├── UI_CONSISTENCY_GUIDELINES.md
    ├── AUDIT_LOGS_IMPLEMENTATION.md
    └── [other documentation]
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL/MariaDB
- XAMPP/WAMP (or standalone MySQL)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure database:
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=iem_database
   PORT=5000
   ```

4. Run migrations:
```bash
node migrations/migrate.js
```

5. Start backend server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure API URL:
   - Update `REACT_APP_API_BASE` in `.env` file:
   ```env
   REACT_APP_API_BASE=http://localhost:5000/api
   ```

4. Start frontend development server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## 🗄️ Database Schema

### Key Tables

#### `epc_chains`
- `chainCode` - Chain identifier (vChain, sMH, oH)
- `chainName` - Chain display name

#### `epc_store_class`
- `storeClassCode` - Classification code (ASEH, BSH, etc.)
- `storeClassification` - Classification name

#### `epc_categories`
- `catCode` - Category code
- `category` - Category name (Lamps, Decors, etc.)

#### `epc_item_list`
- `itemCode` - Item identifier
- `itemDescription` - Item name
- `itemCategory` - Product category

#### `epc_item_exclusivity_list`
- `itemCode` - Item identifier (primary key)
- `vChainASEH`, `vChainBSH`, ... - Dynamic columns (15 total)
- Values: `1` = assigned, `0` = removed, `NULL` = never assigned

#### `epc_branches`
- `branchCode` - Branch identifier
- `branchName` - Branch name
- `chainCode` - Associated chain
- `lampsClass`, `decorsClass`, etc. - Category assignments

#### `audit_logs`
- Complete audit trail of all system operations
- Tracks user, action, entity, and changes

## 🔐 Security Features

- ✅ SQL injection prevention with parameterized queries
- ✅ Dynamic column whitelisting for security
- ✅ CORS configuration for network access
- ✅ Audit logging for all operations
- ✅ Input validation on frontend and backend

## 📊 API Endpoints

### Filters
- `GET /api/filters/chains` - Get all chains
- `GET /api/filters/categories` - Get all categories
- `GET /api/filters/store-classes` - Get store classifications
- `GET /api/filters/items` - Get filtered items
- `GET /api/filters/branches` - Get filtered branches
- `GET /api/filters/items-for-assignment` - Get assignable items
- `GET /api/filters/available-branches` - Get available branches

### Inventory
- `POST /api/inventory/add-exclusivity-items` - Bulk add items
- `POST /api/inventory/remove-exclusivity-item` - Remove item
- `POST /api/inventory/add-exclusivity-branches` - Bulk add branches

### Reports
- `GET /api/reports/exclusivity-report` - Generate exclusivity report

### Audit
- `GET /api/audit/logs` - Get audit logs with filtering

## 🎨 UI Consistency

All modals and forms follow strict UI consistency guidelines:
- Modal closes only via Cancel button or after successful save
- Confirmation dialog for unsaved changes
- Snackbar notifications for success/error messages
- Consistent button styling and placement
- Descriptions shown in dropdowns instead of codes
- Clear button separate from Add to List button

See `docs/UI_CONSISTENCY_GUIDELINES.md` for complete guidelines.

## 🔄 Development Workflow

### Adding New Features
1. Follow UI consistency guidelines
2. Add backend route in appropriate file
3. Create/update frontend component
4. Add audit logging for operations
5. Update this README if needed

### Code Quality
- Use meaningful variable names
- Add comments for complex logic
- Follow existing code patterns
- Test all CRUD operations
- Validate user inputs

## 📝 Common Operations

### Adding Items to Exclusivity
1. Navigate to Item Maintenance
2. Select Chain, Category, Store Class
3. Choose items from dropdown
4. Click "Add to List"
5. Review added items
6. Click "Save All"

### Managing Branch Assignments
1. Navigate to Branch Maintenance
2. Select Chain, Category, Store Class
3. Choose branches from dropdown
4. Click "Add to List"
5. Review added branches
6. Click "Save All"

### Viewing Audit Logs
1. Navigate to Audit Logs
2. Filter by entity type, action, date range
3. Search by user or entity name
4. View detailed change history

## 🐛 Troubleshooting

### Backend won't start
- Check if MySQL/MariaDB service is running
- Verify database credentials in `.env`
- Check if port 5000 is available
- Run migrations: `node migrations/migrate.js`

### Frontend won't connect
- Verify backend is running
- Check `REACT_APP_API_BASE` in frontend `.env`
- Check browser console for CORS errors
- Clear browser cache

### Database errors
- Ensure database exists
- Run migrations to create tables
- Check database user permissions
- Verify connection string

## 📞 Support

For issues or questions:
1. Check documentation in `docs/` folder
2. Review audit logs for operation history
3. Check browser console for errors
4. Verify database table structure

## 📄 License

Internal Use Only - Company Proprietary

## 👥 Contributors

- Development Team
- Last Updated: November 4, 2025

---

**Version:** 1.0.0  
**Status:** Production Ready ✅
