# IEM - Item Exclusivity Management System

A comprehensive web-based system for managing item and branch exclusivity across multiple store chains and classifications.

## 📁 Project Structure

```
IEM/
├── start-production.bat          # 🚀 One-click deployment script
├── deploy.bat                    # Manual deployment script
├── stop.bat                      # Stop all services
├── PRODUCTION_README.md          # Quick start guide
├── DEPLOYMENT_GUIDE.md           # Complete deployment guide
├── DEPLOYMENT_CHECKLIST.md       # Deployment checklist
├── frontend/
│   ├── .env                      # Frontend config (API URL)
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/           # UI components
│       │   ├── AddItem.js
│       │   ├── AuditLogs.js
│       │   ├── CheckInItem.js
│       │   ├── CheckOutItem.js
│       │   ├── ExclusivityForm.js
│       │   ├── Filter.js
│       │   ├── ForgotPassword.js
│       │   ├── ItemDetailsModal.js
│       │   ├── ItemMaintenance.js
│       │   ├── ListOfBranch.js
│       │   ├── ListOfExclusion.js
│       │   ├── ListOfExclusionContainer.js
│       │   ├── ListOfItems.js
│       │   ├── Login.js
│       │   ├── NBFIExclusivityForm.js
│       │   ├── NBFIFilter.js
│       │   ├── NBFIItemMaintenance.js
│       │   ├── NBFIListOfBranch.js
│       │   ├── NBFIListOfExclusion.js
│       │   ├── NBFIListOfExclusionContainer.js
│       │   ├── NBFIListOfItems.js
│       │   ├── NBFIStoreMaintenance.js
│       │   ├── ProtectedRoute.js
│       │   ├── Reports.js
│       │   ├── ResetPassword.js
│       │   ├── Resources.js
│       │   ├── Reports.js
│       │   ├── SmartRedirect.js
│       │   ├── SignUp.js
│       │   ├── StoreMaintenance.js
│       │   ├── StoreMaintenance_backup_20251111_155000.js
│       │   ├── UserMaintenance.js
│       │   └── ViewItems.js
│       ├── context/              # AuthContext and other contexts
│       └── utils/                # Utilities (excelExport, helpers)
│       └── index.js
│       └── App.js
│   └── build/                    # Production build (created by npm run build)
├── backend/
│   ├── .env                      # Backend config (DB, Email, JWT)
│   ├── package.json
│   ├── server.js                 # Main server file
│   ├── config/
│   │   └── database.js           # Database connection
│   ├── routes/                   # Express route handlers
│   ├── middleware/               # JWT verification, other middleware
│   ├── utils/                    # auditLogger, emailService, logger
│   └── migrations/               # Database migrations
└── docs/                         # Documentation files
    ├── EMAIL_CONFIGURATION_GUIDE.md
    ├── AUDIT_LOGS_IMPLEMENTATION.md
    └── UI_CONSISTENCY_GUIDELINES.md
```
│   │   ├── components/
│   │   │   ├── Login.js          # Login page
│   │   │   ├── SignUp.js         # Registration page
│   │   │   ├── ForgotPassword.js # Password reset request
│   │   │   ├── ResetPassword.js  # Password reset form
│   │   │   ├── Dashboard.js      # Main dashboard with navigation
│   │   │   ├── ExclusivityForm.js# Main exclusivity view
│   │   │   ├── ItemMaintenance.js# Item management
│   │   │   ├── StoreMaintenance.js# Branch management
│   │   │   ├── UserMaintenance.js# User management (Admin)
│   │   │   ├── AuditLogs.js      # Audit log viewer (Admin)
│   │   │   └── Reports.js        # Reporting interface
│   │   ├── context/
│   │   │   └── AuthContext.js    # Authentication state
│   │   └── utils/
│   │       └── excelExport.js    # Excel export utility
│   └── build/                    # Production build (created by npm run build)
├── backend/
│   ├── .env                      # Backend config (DB, Email, JWT)
│   ├── server.js                 # Main server file
│   ├── config/
│   │   └── database.js           # Database connection
│   ├── routes/
│   │   ├── auth.js               # Authentication endpoints
│   │   ├── inventory.js          # Item management endpoints
│   │   ├── filters.js            # Filter data endpoints
│   │   ├── dashboard.js          # Dashboard data endpoints
│   │   ├── reports.js            # Report generation endpoints
│   │   └── audit.js              # Audit log endpoints
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── utils/
│   │   ├── auditLogger.js        # Audit logging utility
│   │   ├── emailService.js       # Email sending service
│   │   └── logger.js             # General logging
│   └── migrations/               # Database migrations
│       ├── migrate.js            # Migration runner
│       ├── 001-011_*.js          # Migration files
│       └── QUICKSTART.md         # Migration guide
└── docs/
    ├── EMAIL_CONFIGURATION_GUIDE.md  # Email setup guide
    ├── AUDIT_LOGS_IMPLEMENTATION.md  # Audit system docs
    └── UI_CONSISTENCY_GUIDELINES.md  # UI guidelines
```
### Notes
- The frontend `src/components/` folder contains many feature components (Login, SignUp, NBFI/EPC maintenance views, filters, etc.).
- The backend `routes/` folder contains route files for `auth`, `inventory`, `filters`, `dashboard`, `reports`, and `audit`.

If you'd like, I can expand the `components/` list with exact filenames present in `frontend/src/components/` (e.g., `NBFIStoreMaintenance.js`, `StoreMaintenance.js`, `ExclusivityForm.js`) — say the word and I'll enumerate them.

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

Backend will run on `http://localhost:3001` (or `http://<SERVER_IP>:3001` when accessed over the network)

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
    REACT_APP_API_BASE=http://localhost:3001/api
    # or for network testing:
    # REACT_APP_API_BASE=http://192.168.0.157:3001/api
    ```

4. Start frontend development server:
```bash
npm start
```

Frontend (dev) will run on `http://localhost:3020` and production build is served on `http://<SERVER_IP>:3020` by the deployment scripts

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
- Last Updated: December 9, 2025

---

**Version:** 1.0.0  
**Status:** Production Ready ✅
