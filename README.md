# IEM - Item Exclusivity Management System

A comprehensive web-based system for managing item and branch exclusivity across multiple store chains and classifications.

## 🚀 Quick Start (Production Deployment)

### For Production Deployment:
**Simply double-click: `start-production.bat`**

Then access the application at: **http://192.168.0.138:3000**

Default login:
- Username: `admin`
- Password: `admin123`

**⚠️ Change the default password immediately after first login!**

### For Detailed Instructions:
- See **PRODUCTION_README.md** for quick start guide
- See **DEPLOYMENT_GUIDE.md** for complete deployment instructions
- See **DEPLOYMENT_CHECKLIST.md** for deployment checklist

---

## 🌟 System Overview

The IEM system manages the exclusivity of items and branches across different store chains (Various, SM, Orocan) and classifications (ASEH, BSH, CSM, DSS, ESES) for various product categories (Lamps, Decors, Clocks, Stationery, Frames).

## 📋 Features

### Core Modules
1. **Exclusivity Form** - Main interface for viewing and managing exclusivity assignments
2. **Item Maintenance** - Add, edit, and remove item exclusivity assignments
3. **Store Maintenance** - Manage branch assignments by store classification
4. **User Management** - Manage user accounts and roles (Admin only)
5. **Reports** - Generate exclusivity reports
6. **Audit Logs** - Track all system changes and user actions (Admin only)

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ Password reset via email
- ✅ Secure session management
- ✅ Comprehensive audit logging

### Key Capabilities
- ✅ Dynamic filtering by chain, category, and store classification
- ✅ Bulk operations for items and branches
- ✅ Real-time data validation
- ✅ Email notifications (password reset)
- ✅ Excel export functionality
- ✅ Responsive Material-UI design
- ✅ Network-accessible deployment

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Material-UI 5** - Component library
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js v24.11.0** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **mysql2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **nodemailer** - Email service

### Email Service
- **Brevo SMTP** - 
- **From:** 

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
│   ├── src/
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
