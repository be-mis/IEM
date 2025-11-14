# IEM System - Complete Flowchart Generation Guide

**Document Version:** 1.0  
**Last Updated:** November 13, 2025  
**Purpose:** Comprehensive flowchart generation prompt for end-user documentation

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Flowchart Generation Prompt](#flowchart-generation-prompt)
3. [Visual Design Guidelines](#visual-design-guidelines)
4. [Mermaid Flowchart Code](#mermaid-flowchart-code)

---

## System Overview

The **IEM (Item Exclusivity Management) System** is a dual business unit application that manages item and store exclusivity across different retail chains and store classifications.

### Key Characteristics:
- **Two Business Units:** EPC (Everyday Products Corp) and NBFI (Barbizon Fashion)
- **Three User Roles:** Admin, Manager, Employee
- **Separate Table Sets:** Each business unit has independent database tables
- **Role-Based Access Control:** Multi-layer permission system
- **Technology Stack:** React 18, Node.js, Express, MySQL

---

## Flowchart Generation Prompt

Use this detailed prompt with any flowchart generation tool (Mermaid, Lucidchart, Draw.io, etc.) to create a comprehensive system flow diagram.

### 1. User Access & Authentication Flow

#### Starting Point: User Visits System

**New User Registration Flow:**
```
START → Navigate to Signup Page (/signup)
↓
Enter Registration Details:
  ├─ Username (min 3 characters)
  ├─ Email (valid format)
  ├─ Password (min 6 characters)
  ├─ Confirm Password (must match)
  ├─ Role Selection: Employee OR Manager
  └─ Business Unit Selection: NBFI OR EPC
↓
Business Unit Auto-Detection:
  ├─ If email ends with @barbizonfashion.com → Auto-select NBFI
  └─ If email ends with @everydayproductscorp.com → Auto-select EPC
↓
Submit Registration (POST /api/auth/register)
↓
Backend Validation:
  ├─ Check: username and email are unique
  ├─ Check: businessUnit is NBFI or EPC (required)
  ├─ Check: password meets minimum length
  └─ If validation fails → Return error message
↓
Backend Processing:
  ├─ Hash password using bcrypt (salt rounds: 10)
  ├─ INSERT INTO users (username, email, password, role, business_unit, is_active)
  └─ Log audit entry (entityType: 'auth', action: 'register')
↓
Success Response → Redirect to Login Page
↓
Show "Registration Successful" message
```

**Existing User Login Flow:**
```
START → Navigate to Login Page (/login)
↓
Enter Login Credentials:
  ├─ Username or Email
  └─ Password
↓
Submit Login (POST /api/auth/login)
↓
Backend Authentication:
  ├─ Query: SELECT * FROM users WHERE username = ? OR email = ?
  ├─ Check: User exists and is_active = TRUE
  └─ If user not found → Return "Invalid credentials" error
↓
Password Verification:
  ├─ Compare entered password with hashed password (bcrypt)
  └─ If mismatch → Return "Invalid credentials" error
↓
Generate JWT Token with payload:
  {
    userId: <user.id>,
    username: <user.username>,
    email: <user.email>,
    role: <user.role>,           // admin, manager, or employee
    businessUnit: <user.business_unit>  // NBFI or EPC
  }
  Token expiration: 24 hours
↓
Backend Audit Logging:
  └─ Log audit entry (entityType: 'auth', action: 'login', userId, userName, ip)
↓
Frontend Token Storage:
  ├─ Store token in localStorage
  ├─ Store user object in localStorage
  └─ Set Axios default header: Authorization: Bearer <token>
↓
Smart Redirect Logic → See Section 2
```

### 2. Smart Routing & Dashboard Access

**Smart Redirect After Login:**
```
User Successfully Logged In
↓
DECISION: What is user.role?
├─ IF role = "admin"
│   └─ Redirect to /dashboard/exclusivity-form (EPC default)
│
├─ IF role = "manager" OR role = "employee"
│   └─ DECISION: What is user.businessUnit?
│       ├─ IF businessUnit = "EPC"
│       │   └─ Redirect to /dashboard/exclusivity-form
│       │
│       └─ IF businessUnit = "NBFI"
│           └─ Redirect to /dashboard/nbfi-exclusivity-form
│
└─ Dashboard Loads with Filtered Menu
```

**Dashboard Menu Access Control:**

| Menu Item | Visibility Rule | Available To |
|-----------|----------------|--------------|
| **Exclusivity Form** | `role === 'admin' OR businessUnit === 'EPC'` | Admin, EPC Users |
| **NBFI Exclusivity Form** | `role === 'admin' OR businessUnit === 'NBFI'` | Admin, NBFI Users |
| **Item Maintenance** | `role === 'admin' OR businessUnit === 'EPC'` | Admin, EPC Users |
| **Store Maintenance** | `role === 'admin' OR businessUnit === 'EPC'` | Admin, EPC Users |
| **User Management** | `role === 'admin'` | Admin Only |
| **Audit Logs** | `role === 'admin'` | Admin Only |

**Menu Filtering Logic:**
```
Dashboard Renders Menu Items
↓
FOR EACH menu item:
  ├─ Check: item.adminOnly === true?
  │   └─ IF TRUE AND user.role ≠ 'admin' → HIDE menu item
  │
  ├─ Check: item.epcOnly === true?
  │   └─ IF TRUE AND (user.role ≠ 'admin' AND user.businessUnit ≠ 'EPC') → HIDE
  │
  └─ Check: item.nbfiOnly === true?
      └─ IF TRUE AND (user.role ≠ 'admin' AND user.businessUnit ≠ 'NBFI') → HIDE
↓
Display Filtered Menu to User
↓
User Clicks Menu Item
↓
Component Loads → Re-verify Permission
  ├─ IF unauthorized → Show warning: "Access denied"
  └─ IF authorized → Render component content
```

### 3. Exclusivity Form Workflow (EPC)

**Step 1: Filter Selection**
```
User Opens Exclusivity Form
↓
Filter Section Displays Three Dropdowns:
  ├─ Chain (vChain, sMH, oH)
  ├─ Category (Lamps, Decors, Clocks, Frames, Stationery)
  └─ Store Class (ASEH, BSH, CSM, DSS, ESES)
↓
User Selects: Chain = "vChain", Category = "Lamps", Store Class = "ASEH"
↓
Frontend: GET /api/filters/branches?chain=vChain&category=Lamps&storeClass=ASEH
↓
Backend Processing:
  ├─ Construct column name: category + "Class" = "lampsClass"
  ├─ Query: SELECT storeCode, storeName FROM epc_stores
  │          WHERE chainCode = 'vChain' AND lampsClass = 'ASEH'
  └─ Return: [{ branchCode: 'B001', branchName: 'Store A' }, ...]
↓
Frontend: Display stores in "List of Branches" accordion
```

**Step 2: View Items for Category**
```
Frontend: GET /api/filters/items?category=Lamps
↓
Backend Processing:
  ├─ Query: SELECT itemCode, itemDescription FROM epc_item_list
  │          WHERE LOWER(itemCategory) = 'lamps'
  └─ Return: [{ itemCode: '2010020198018168', itemDescription: 'AEGEAN ALICIA TABLE LAMP' }, ...]
↓
Frontend: Display items in "List of Items" accordion
```

**Step 3: View Current Exclusivity Assignments**
```
Frontend: GET /api/filters/exclusion-list?chain=vChain&category=Lamps&storeClass=ASEH
↓
Backend Processing:
  ├─ Construct column name: chain + storeClass = "vChainASEH"
  ├─ Validate column exists in epc_item_exclusivity_list table
  ├─ Query: SELECT i.itemCode, i.itemDescription, e.vChainASEH as quantity
  │          FROM epc_item_list i
  │          LEFT JOIN epc_item_exclusivity_list e ON i.itemCode = e.itemCode
  │          WHERE i.itemCategory = 'Lamps' AND e.vChainASEH = 1
  └─ Return: Currently assigned items with their quantities
↓
Frontend: Display in "Exclusion" accordion as Store-Item Matrix:
  ├─ Rows: Items (itemCode, itemDescription)
  ├─ Columns: Stores (storeCode, storeName)
  └─ Cells: Quantity checkboxes/values
```

**Step 4: Assign New Items to Exclusivity**
```
User Selects Item from "Available Items" Dropdown
↓
User Clicks "Add to List" Button
↓
Item Appears in Pending Assignment List
↓
User Enters Quantity for Each Item (optional)
↓
User Clicks "Save All" Button
↓
Frontend: POST /api/inventory/add-exclusivity-items
  Body: {
    items: [
      { itemCode: '2010020198018168', quantity: 1 }
    ],
    chain: 'vChain',
    storeClass: 'ASEH',
    category: 'Lamps'
  }
↓
Backend Validation & Processing:
  FOR EACH item:
    ├─ Validate: itemCode exists in epc_item_list
    │   └─ IF NOT EXISTS → Add to failed array with reason
    │
    ├─ Construct column name: chain + storeClass = "vChainASEH"
    │
    ├─ Validate: Column "vChainASEH" exists in epc_item_exclusivity_list
    │   └─ IF NOT EXISTS → Add to failed array with reason
    │
    ├─ Check: Does itemCode already exist in epc_item_exclusivity_list?
    │   ├─ IF EXISTS:
    │   │   └─ UPDATE epc_item_exclusivity_list 
    │   │      SET vChainASEH = 1, updated_at = NOW()
    │   │      WHERE itemCode = ?
    │   │
    │   └─ IF NOT EXISTS:
    │       └─ INSERT INTO epc_item_exclusivity_list
    │          (itemCode, vChainASEH) VALUES (?, 1)
    │
    └─ Log Audit Entry:
        └─ (entityType: 'item_exclusivity', action: 'update', 
            entityId: itemCode, userId, userName, details: { chain, storeClass, quantity })
↓
Backend Response: { success: [...], failed: [...] }
↓
Frontend:
  ├─ Show success snackbar: "X items assigned successfully"
  ├─ If failures exist → Show error details
  └─ Refresh "Exclusion" list to show new assignments
```

**Step 5: Remove Items from Exclusivity**
```
User Views Assigned Items in Exclusion Matrix
↓
User Clicks "X" (Remove) Button on Specific Item
↓
Confirmation Dialog: "Are you sure you want to remove this item?"
↓
User Confirms
↓
Frontend: POST /api/inventory/remove-exclusivity-item
  Body: {
    itemCode: '2010020198018168',
    column: 'vChainASEH'
  }
↓
Backend Processing:
  ├─ Validate: column name exists in epc_item_exclusivity_list
  ├─ UPDATE epc_item_exclusivity_list 
  │   SET vChainASEH = 0, updated_at = NOW()
  │   WHERE itemCode = ?
  │   (Note: 0 = removed, 1 = assigned, NULL = never assigned)
  │
  └─ Log Audit Entry:
      └─ (entityType: 'item_exclusivity', action: 'update', 
          details: { itemCode, column, newValue: 0 })
↓
Backend Response: Success message
↓
Frontend:
  ├─ Show success snackbar: "Item removed successfully"
  └─ Refresh "Exclusion" list (item no longer appears)
```

**Step 6: Export to Excel**
```
User Clicks "Export to Excel" Button
↓
Frontend Processing (using excelExport.js utility):
  ├─ Fetch current branches (stores)
  ├─ Fetch current items
  ├─ Fetch current quantities from exclusion matrix
  │
  ├─ Generate Excel Data Structure:
  │   ├─ Create worksheet
  │   ├─ Header Row: ["Item Code", "Item Description", Store1, Store2, ...]
  │   ├─ Data Rows: For each item:
  │   │   └─ [itemCode, itemDescription, qty1, qty2, ...]
  │   │
  │   └─ Apply Formatting:
  │       ├─ Bold headers
  │       ├─ Auto-fit column widths
  │       ├─ Add borders to cells
  │       └─ Set number format for quantities
  │
  └─ Generate Excel File:
      └─ Filename: "Exclusivity_Report_{chain}_{category}_{storeClass}_{timestamp}.xlsx"
↓
Browser Downloads File
↓
Show Success Snackbar: "Excel file exported successfully"
```

### 4. NBFI Exclusivity Form Workflow

**Key Differences from EPC:**
```
NBFI Exclusivity Form
├─ Uses NBFI database tables:
│   ├─ nbfi_chains (instead of epc_chains)
│   ├─ nbfi_categories → nbfi_brands (terminology change)
│   ├─ nbfi_store_class (instead of epc_store_class)
│   ├─ nbfi_stores (instead of epc_stores)
│   ├─ nbfi_item_list (instead of epc_item_list)
│   └─ nbfi_store_exclusivity_list (instead of epc_item_exclusivity_list)
│
├─ Terminology Changes:
│   ├─ "List of Branches" → "List of Stores"
│   └─ "Categories" → "Brands"
│
└─ Workflow Identical to EPC:
    ├─ Same filter selection process
    ├─ Same assign/remove logic
    ├─ Same Excel export functionality
    └─ Same access control enforcement
```

**Access Control for NBFI Form:**
```
User Attempts to Access NBFI Exclusivity Form
↓
DECISION: Is user authorized?
├─ IF user.role === 'admin' → ALLOW ACCESS (admin can access all forms)
│
└─ IF user.role !== 'admin'
    └─ DECISION: Is user.businessUnit === 'NBFI'?
        ├─ IF YES → ALLOW ACCESS
        └─ IF NO → SHOW WARNING: "NBFI business unit access required"
```

### 5. Item Maintenance Workflow (EPC Only)

**Purpose:** Bulk assign items to exclusivity for a specific chain/category/store class combination.

```
User Opens Item Maintenance
↓
Select Filters:
  ├─ Chain (vChain, sMH, oH)
  ├─ Category (Lamps, Decors, etc.)
  └─ Store Class (ASEH, BSH, etc.)
↓
Frontend: GET /api/filters/items-for-assignment?chain=X&category=Y&storeClass=Z
↓
Backend Processing:
  ├─ Construct column name: chain + storeClass
  ├─ Query: Find items NOT yet assigned to this combination
  │   SELECT i.itemCode, i.itemDescription
  │   FROM epc_item_list i
  │   LEFT JOIN epc_item_exclusivity_list e ON i.itemCode = e.itemCode
  │   WHERE i.itemCategory = ? 
  │     AND (e.itemCode IS NULL OR e.{column} IS NULL OR e.{column} != 1)
  └─ Return: Available items for assignment
↓
Frontend: Display available items in table with checkboxes
↓
User Selects Multiple Items (checkbox selection)
↓
User Clicks "Assign Selected Items" Button
↓
Frontend: POST /api/inventory/add-exclusivity-items (bulk)
  Body: {
    items: [
      { itemCode: 'ITEM001', quantity: 1 },
      { itemCode: 'ITEM002', quantity: 1 },
      ...
    ],
    chain: 'vChain',
    storeClass: 'ASEH',
    category: 'Lamps'
  }
↓
Backend: Process batch insert/update (same as Exclusivity Form Step 4)
  ├─ Validate each item
  ├─ Insert or update epc_item_exclusivity_list
  └─ Log audit entries for each item
↓
Backend Response:
  {
    success: [{ itemCode: 'ITEM001', ... }, ...],
    failed: [{ itemCode: 'ITEM999', reason: 'Invalid item code' }, ...]
  }
↓
Frontend:
  ├─ Show success summary: "X items assigned, Y failed"
  ├─ Display failed items in error dialog (if any)
  └─ Option to "Export Failed Items" as Excel for review
```

### 6. Store Maintenance Workflow (EPC Only)

**Purpose:** Add new stores/branches to the system.

```
User Opens Store Maintenance (Admin or EPC Manager)
↓
User Clicks "Add New Store" Button
↓
Modal Opens with Store Form:
  ├─ Store Code (required, unique)
  ├─ Store Name (required)
  ├─ Chain Code (dropdown: vChain, sMH, oH)
  ├─ Lamps Class (dropdown: ASEH, BSH, CSM, DSS, ESES)
  ├─ Decors Class (dropdown: ASEH, BSH, CSM, DSS, ESES)
  ├─ Clocks Class (dropdown: ASEH, BSH, CSM, DSS, ESES)
  ├─ Frames Class (dropdown: ASEH, BSH, CSM, DSS, ESES)
  └─ Stationery Class (dropdown: ASEH, BSH, CSM, DSS, ESES)
↓
User Fills Form and Clicks "Save"
↓
Frontend: POST /api/inventory/add-exclusivity-branches
  Body: {
    branches: [{
      storeCode: 'B999',
      storeName: 'New Store XYZ',
      chainCode: 'vChain',
      lampsClass: 'ASEH',
      decorsClass: 'BSH',
      clocksClass: 'CSM',
      framesClass: 'DSS',
      stationeryClass: 'ESES'
    }]
  }
↓
Backend Validation:
  ├─ Check: storeCode is unique
  ├─ Check: chainCode exists in epc_chains
  └─ Check: all class codes exist in epc_store_class
↓
Backend Processing:
  ├─ INSERT INTO epc_stores (storeCode, storeName, chainCode, 
  │                           lampsClass, decorsClass, clocksClass, 
  │                           framesClass, stationeryClass)
  │  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  │
  └─ Log Audit Entry:
      └─ (entityType: 'store', action: 'create', entityId: storeCode, 
          userId, userName, details: { storeName, chainCode, ... })
↓
Backend Response: Success message
↓
Frontend:
  ├─ Close modal
  ├─ Show success snackbar: "Store added successfully"
  └─ Refresh stores list
```

**Bulk Store Import (Excel Upload):**
```
User Clicks "Import Stores from Excel"
↓
User Selects Excel File (.xlsx)
  File Format:
    Row 1 (headers): StoreCode, StoreName, ChainCode, LampsClass, DecorsClass, ...
    Row 2+: Data rows
↓
Frontend: Parse Excel file using XLSX library
↓
Frontend: POST /api/inventory/add-exclusivity-branches (bulk)
  Body: { branches: [{ storeCode, storeName, ... }, ...] }
↓
Backend: Process batch insert
  FOR EACH store:
    ├─ Validate data
    ├─ Check duplicates
    ├─ Insert if valid
    └─ Track success/failure
↓
Backend Response: { success: [...], failed: [...] }
↓
Frontend:
  ├─ Show summary: "X stores imported, Y failed"
  └─ Option to "Export Failed Stores" for correction
```

### 7. User Management Workflow (Admin Only)

**Create New User:**
```
Admin Opens User Management
↓
Admin Clicks "Add User" Button
↓
User Form Modal Opens:
  ├─ Username (required, unique)
  ├─ Email (required, unique, valid format)
  ├─ Password (required, min 6 characters)
  ├─ Role (dropdown: Admin, Manager, Employee)
  ├─ Business Unit (dropdown: NBFI, EPC) - REQUIRED
  └─ Active Status (toggle: Active/Inactive)
↓
Admin Fills Form and Clicks "Create User"
↓
Frontend: POST /api/auth/users
  Body: {
    username: 'john.doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'manager',
    businessUnit: 'EPC',
    is_active: true
  }
↓
Backend Validation:
  ├─ Check: username and email are unique
  ├─ Check: businessUnit is 'NBFI' or 'EPC' (required)
  ├─ Check: password meets minimum length
  └─ IF validation fails → Return error
↓
Backend Processing:
  ├─ Hash password: bcrypt.hash(password, 10)
  ├─ INSERT INTO users (username, email, password, role, business_unit, is_active)
  │   VALUES (?, ?, ?, ?, ?, ?)
  │
  └─ Log Audit Entry:
      └─ (entityType: 'user', action: 'create', entityId: result.insertId,
          userId: adminId, userName: adminUsername, 
          details: { username, email, role, businessUnit })
↓
Backend Response: { message: 'User created successfully', userId: 123 }
↓
Frontend:
  ├─ Close modal
  ├─ Show success snackbar: "User created successfully"
  └─ Refresh users table
```

**Edit Existing User:**
```
Admin Clicks "Edit" Icon on User Row
↓
Edit User Modal Opens (pre-filled with current data):
  ├─ Username (read-only, cannot change)
  ├─ Email (editable)
  ├─ Password (optional, leave blank to keep current)
  ├─ Role (editable)
  ├─ Business Unit (editable: NBFI or EPC)
  └─ Active Status (editable)
↓
Admin Modifies Fields and Clicks "Update User"
↓
Frontend: PUT /api/auth/users/:id
  Body: {
    email: 'newemail@example.com',
    password: '', // or new password
    role: 'employee',
    businessUnit: 'NBFI',
    is_active: false
  }
↓
Backend Validation:
  ├─ Check: User with :id exists
  ├─ IF email changed → Check new email is unique
  ├─ IF businessUnit changed → Validate is 'NBFI' or 'EPC'
  └─ IF validation fails → Return error
↓
Backend Processing:
  ├─ Build UPDATE query dynamically (only for provided fields)
  ├─ IF password provided → Hash new password
  ├─ UPDATE users 
  │   SET email = ?, role = ?, business_unit = ?, is_active = ?
  │   WHERE id = ?
  │
  └─ Log Audit Entry:
      └─ (entityType: 'user', action: 'update', entityId: userId,
          details: { changes: { email: { old, new }, role: { old, new }, ... } })
↓
Backend Response: Success message
↓
Frontend:
  ├─ Close modal
  ├─ Show success snackbar: "User updated successfully"
  └─ Refresh users table
```

**Delete User:**
```
Admin Clicks "Delete" Icon on User Row
↓
Confirmation Dialog: "Are you sure you want to delete user '{username}'?"
↓
Admin Confirms Deletion
↓
Frontend: DELETE /api/auth/users/:id
↓
Backend Processing:
  ├─ Check: User exists
  ├─ DELETE FROM users WHERE id = ?
  │
  └─ Log Audit Entry:
      └─ (entityType: 'user', action: 'delete', entityId: userId,
          details: { username, email, role, businessUnit })
↓
Backend Response: Success message
↓
Frontend:
  ├─ Show success snackbar: "User deleted successfully"
  └─ Refresh users table (removed user no longer appears)
```

### 8. Audit Logs Workflow (Admin Only)

**View Audit Trail:**
```
Admin Opens Audit Logs Page
↓
Filter Panel Available:
  ├─ Date Range (Start Date, End Date)
  ├─ Entity Type (dropdown: user, item_exclusivity, store, auth, all)
  ├─ Action (dropdown: create, update, delete, login, register, all)
  └─ User Search (text input: search by userName or userEmail)
↓
Admin Applies Filters and Clicks "Search"
↓
Frontend: GET /api/audit/logs?startDate=X&endDate=Y&entityType=Z&action=W&userName=U
↓
Backend Processing:
  ├─ Build dynamic WHERE clause based on provided filters
  ├─ Query: SELECT * FROM audit_logs
  │          WHERE created_at BETWEEN ? AND ?
  │            AND (entityType = ? OR 'all' = ?)
  │            AND (action = ? OR 'all' = ?)
  │            AND (userName LIKE ? OR userEmail LIKE ?)
  │          ORDER BY created_at DESC
  │          LIMIT 100
  │
  └─ Return: Array of audit log entries
↓
Backend Response:
  {
    logs: [
      {
        id: 1,
        entityType: 'item_exclusivity',
        entityId: '2010020198018168',
        entityName: 'AEGEAN ALICIA TABLE LAMP',
        action: 'update',
        userId: 5,
        userName: 'john.doe',
        userEmail: 'john@example.com',
        ip: '192.168.1.100',
        details: { chain: 'vChain', storeClass: 'ASEH', quantity: 1 },
        created_at: '2025-11-13T10:30:00Z'
      },
      ...
    ]
  }
↓
Frontend: Display in Paginated Table:
  Columns:
    ├─ Timestamp (formatted: Nov 13, 2025 10:30 AM)
    ├─ User (userName - userEmail)
    ├─ Action (badge color-coded: create=green, update=blue, delete=red, login=gray)
    ├─ Entity Type (user, item_exclusivity, store, auth)
    ├─ Entity Name
    ├─ IP Address
    └─ Details (expandable JSON view)
↓
Admin Can:
  ├─ Sort by any column
  ├─ Expand "Details" to see full JSON
  ├─ Export current view to Excel (optional feature)
  └─ Navigate pages (if more than 100 results)
```

**Audit Entry Details Structure:**
```
details: {
  // For item_exclusivity:
  chain: 'vChain',
  storeClass: 'ASEH',
  category: 'Lamps',
  quantity: 1,
  
  // For user management:
  changes: {
    email: { old: 'old@example.com', new: 'new@example.com' },
    role: { old: 'employee', new: 'manager' },
    businessUnit: { old: 'EPC', new: 'NBFI' }
  },
  
  // For auth (login):
  method: 'password',
  userAgent: 'Mozilla/5.0...',
  
  // For auth (register):
  role: 'employee',
  businessUnit: 'EPC'
}
```

### 9. Database Architecture

**EPC Business Unit Tables:**

```sql
-- Lookup Tables
epc_chains
├─ chainCode VARCHAR(20) PRIMARY KEY
└─ chainName VARCHAR(100)
   Examples: ('vChain', 'Various Chain'), ('sMH', 'SM Hypermarket'), ('oH', 'Other Hypermarket')

epc_categories
├─ catCode VARCHAR(20) PRIMARY KEY
└─ category VARCHAR(50)
   Examples: ('01', 'Lamps'), ('02', 'Decors'), ('03', 'Clocks'), ('04', 'Frames'), ('05', 'Stationery')

epc_store_class
├─ storeClassCode VARCHAR(20) PRIMARY KEY
└─ storeClassification VARCHAR(100)
   Examples: ('ASEH', 'A Super Elite High'), ('BSH', 'B Super High'), ('CSM', 'C Super Medium'), 
             ('DSS', 'D Super Standard'), ('ESES', 'ES Elite Standard')

-- Master Data Tables
epc_stores
├─ id INT AUTO_INCREMENT PRIMARY KEY
├─ storeCode VARCHAR(20) UNIQUE NOT NULL
├─ storeName VARCHAR(150) NOT NULL
├─ chainCode VARCHAR(20) FOREIGN KEY → epc_chains.chainCode
├─ lampsClass VARCHAR(20) → epc_store_class.storeClassCode
├─ decorsClass VARCHAR(20) → epc_store_class.storeClassCode
├─ clocksClass VARCHAR(20) → epc_store_class.storeClassCode
├─ framesClass VARCHAR(20) → epc_store_class.storeClassCode
├─ stationeryClass VARCHAR(20) → epc_store_class.storeClassCode
├─ created_at TIMESTAMP
└─ updated_at TIMESTAMP

epc_item_list
├─ id INT AUTO_INCREMENT PRIMARY KEY
├─ itemCode VARCHAR(16) UNIQUE NOT NULL
├─ itemDescription VARCHAR(50) NOT NULL
├─ itemCategory VARCHAR(15) NOT NULL (Lamps, Decors, Clocks, Frames, Stationery)
├─ created_at TIMESTAMP
└─ updated_at TIMESTAMP

-- Exclusivity Matrix Table
epc_item_exclusivity_list
├─ id INT AUTO_INCREMENT PRIMARY KEY
├─ itemCode VARCHAR(20) UNIQUE NOT NULL
├─ vChainASEH INT(2) DEFAULT NULL  -- Values: 1=assigned, 0=removed, NULL=never assigned
├─ vChainBSH INT(2) DEFAULT NULL
├─ vChainCSM INT(2) DEFAULT NULL
├─ vChainDSS INT(2) DEFAULT NULL
├─ vChainESES INT(2) DEFAULT NULL
├─ sMHASEH INT(2) DEFAULT NULL
├─ sMHBSH INT(2) DEFAULT NULL
├─ sMHCSM INT(2) DEFAULT NULL
├─ sMHDSS INT(2) DEFAULT NULL
├─ sMHESES INT(2) DEFAULT NULL
├─ oHASEH INT(2) DEFAULT NULL
├─ oHBSH INT(2) DEFAULT NULL
├─ oHCSM INT(2) DEFAULT NULL
├─ oHDSS INT(2) DEFAULT NULL
├─ oHESES INT(2) DEFAULT NULL
├─ created_at TIMESTAMP
└─ updated_at TIMESTAMP

-- Total 15 columns: 3 chains × 5 store classes
```

**NBFI Business Unit Tables:**

```sql
-- Same structure as EPC, but prefixed with nbfi_
nbfi_chains
nbfi_categories (also called nbfi_brands in some contexts)
nbfi_store_class
nbfi_stores
nbfi_item_list
nbfi_store_exclusivity_list (same 15 column structure as epc_item_exclusivity_list)
```

**System Tables:**

```sql
users
├─ id INT AUTO_INCREMENT PRIMARY KEY
├─ username VARCHAR(50) UNIQUE NOT NULL
├─ email VARCHAR(100) UNIQUE NOT NULL
├─ password VARCHAR(255) NOT NULL (bcrypt hashed)
├─ role ENUM('admin', 'manager', 'employee') NOT NULL
├─ business_unit ENUM('NBFI', 'EPC') DEFAULT NULL  -- REQUIRED for non-admin users
├─ is_active BOOLEAN DEFAULT TRUE
├─ created_at TIMESTAMP
└─ updated_at TIMESTAMP

audit_logs
├─ id INT AUTO_INCREMENT PRIMARY KEY
├─ entityType VARCHAR(50) NOT NULL (user, item_exclusivity, store, auth)
├─ entityId VARCHAR(50) NULL
├─ entityName VARCHAR(255) NULL
├─ action VARCHAR(50) NOT NULL (create, update, delete, login, register, login_failed)
├─ userId INT NULL
├─ userName VARCHAR(50) NULL
├─ userEmail VARCHAR(100) NULL
├─ ip VARCHAR(45) NULL
├─ details JSON NULL
└─ created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

migrations
├─ id INT AUTO_INCREMENT PRIMARY KEY
├─ name VARCHAR(255) UNIQUE NOT NULL
└─ executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Column Naming Convention in Exclusivity Tables:**
```
Format: {chainCode}{storeClassCode}

Examples:
- vChain + ASEH = vChainASEH
- sMH + BSH = sMHBSH
- oH + ESES = oHESES

All 15 combinations:
1. vChainASEH    6. sMHASEH      11. oHASEH
2. vChainBSH     7. sMHBSH       12. oHBSH
3. vChainCSM     8. sMHCSM       13. oHCSM
4. vChainDSS     9. sMHDSS       14. oHDSS
5. vChainESES   10. sMHESES      15. oHESES
```

### 10. Security & Access Control

**JWT Token Flow:**
```
Login Successful
↓
Generate JWT Token:
  Header: { alg: 'HS256', typ: 'JWT' }
  Payload: {
    userId: 123,
    username: 'john.doe',
    email: 'john@example.com',
    role: 'manager',
    businessUnit: 'EPC',
    iat: 1699876543,  // issued at timestamp
    exp: 1699962943   // expires in 24 hours
  }
  Secret: process.env.JWT_SECRET
↓
Token Format: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMy..."
↓
Frontend Storage:
  ├─ localStorage.setItem('token', token)
  ├─ localStorage.setItem('user', JSON.stringify(userObject))
  └─ axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
↓
Every API Request:
  ├─ Frontend: Include Authorization header
  ├─ Backend Middleware: verifyToken()
  │   ├─ Extract token from header
  │   ├─ Verify signature using JWT_SECRET
  │   ├─ Check expiration
  │   └─ Decode payload → req.user = { userId, username, role, businessUnit }
  │
  └─ IF token invalid or expired → Return 401 Unauthorized
↓
Continue Processing Request with User Context
```

**Multi-Layer Access Control:**

**Layer 1: Frontend Menu Filtering**
```
Dashboard Component Mounts
↓
FOR EACH menu item:
  Apply visibility rules based on:
    ├─ user.role
    └─ user.businessUnit
↓
Render only authorized menu items
↓
Prevents unauthorized users from seeing restricted options
```

**Layer 2: Frontend Component Rendering**
```
User Navigates to Route (e.g., /dashboard/user-management)
↓
Component Loads (e.g., UserMaintenance.js)
↓
Component checks:
  IF (user.role !== 'admin') {
    return <Alert severity="warning">Admin access required</Alert>
  }
↓
Render component content if authorized
↓
Prevents unauthorized rendering even if URL is accessed directly
```

**Layer 3: Backend Route Protection (Middleware)**
```
API Request: POST /api/auth/users (Create User - Admin Only)
↓
Middleware Chain:
  1. verifyToken(req, res, next)
     ├─ Check Authorization header exists
     ├─ Verify JWT signature
     ├─ Decode payload → req.user
     └─ IF invalid → Return 401 Unauthorized
  
  2. requireAdmin(req, res, next)
     ├─ Check: req.user.role === 'admin'
     └─ IF NOT admin → Return 403 Forbidden
↓
IF all middleware passes → Execute route handler
↓
Process request with full user context
```

**Layer 4: Backend Business Logic Validation**
```
API Request: POST /api/inventory/add-exclusivity-items
Body: { items: [...], chain: 'vChain', storeClass: 'ASEH', category: 'Lamps' }
↓
Extract user context from JWT: req.user.businessUnit
↓
Determine target table based on business unit:
  IF (req.user.businessUnit === 'EPC') {
    table = 'epc_item_exclusivity_list'
  } ELSE IF (req.user.businessUnit === 'NBFI') {
    table = 'nbfi_store_exclusivity_list'
  }
↓
Execute query on correct table
↓
Ensures data segregation between business units
```

**Password Security:**
```
User Registration/Password Change
↓
Plain Text Password Received: "password123"
↓
Hash Password:
  const hashedPassword = await bcrypt.hash(password, 10)
  // 10 = salt rounds (computational cost)
↓
Hashed Password (stored in DB): "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
↓
Never store plain text password in database

Login Verification:
↓
User enters password: "password123"
↓
Retrieve hashed password from DB
↓
Compare:
  const isValid = await bcrypt.compare(plainPassword, hashedPassword)
↓
IF isValid → Login successful
IF NOT valid → Return "Invalid credentials"
```

**Password Reset Flow:**
```
User Clicks "Forgot Password" on Login Page
↓
User Enters Email Address
↓
Frontend: POST /api/auth/forgot-password
  Body: { email: 'user@example.com' }
↓
Backend Processing:
  ├─ Check: User with email exists
  ├─ Generate random reset token: crypto.randomBytes(32).toString('hex')
  ├─ Hash token and store in DB: users.reset_token = hashedToken
  ├─ Set expiration: users.reset_token_expires = Date.now() + 1 hour
  │
  └─ Send Email via Brevo SMTP:
      Subject: "Password Reset Request"
      Body: "Click here to reset: https://app.com/reset-password?token={token}"
↓
User Receives Email and Clicks Link
↓
User Enters New Password
↓
Frontend: POST /api/auth/reset-password
  Body: { token: 'abc123...', newPassword: 'newpass456' }
↓
Backend Processing:
  ├─ Hash received token
  ├─ Find user: WHERE reset_token = hashedToken AND reset_token_expires > NOW()
  ├─ IF user found:
  │   ├─ Hash new password
  │   ├─ UPDATE users SET password = newHashedPassword, reset_token = NULL
  │   └─ Return success
  └─ IF NOT found → Return "Invalid or expired token"
↓
User Redirected to Login with New Password
```

### 11. Logout Flow

```
User Clicks Logout Icon/Button in Dashboard
↓
Frontend Processing:
  ├─ localStorage.removeItem('token')
  ├─ localStorage.removeItem('user')
  ├─ delete axios.defaults.headers.common['Authorization']
  └─ Clear any other session data
↓
Redirect to /login
↓
User Session Completely Cleared
↓
Must Login Again to Access System
↓
(Note: JWT token still exists but is no longer sent with requests)
```

### 12. Error Handling & User Feedback

**Backend Error → Frontend Snackbar:**
```
API Request Fails
↓
Backend Returns Error Response:
  {
    status: 400 or 401 or 403 or 500,
    data: {
      message: 'Human-readable error message',
      errors: [...] (optional, for validation errors)
    }
  }
↓
Frontend Axios Interceptor Catches Error:
  .catch(error => {
    const message = error.response?.data?.message || 'An error occurred'
    setSnackbar({ open: true, message, severity: 'error' })
  })
↓
Snackbar Appears (Material-UI):
  ├─ Color: Red for errors, Green for success, Blue for info, Yellow for warnings
  ├─ Position: Top-right or bottom-center
  ├─ Duration: 6 seconds (auto-hide)
  └─ Dismissible: User can click X to close
↓
User Sees Clear Feedback and Can Take Corrective Action
```

**Validation Error Handling:**
```
User Submits Form with Invalid Data
↓
Frontend Validation (First Line):
  ├─ Check required fields are filled
  ├─ Check email format
  ├─ Check password length
  └─ IF validation fails → Show inline error messages (red text below field)
↓
IF frontend validation passes → Submit to backend
↓
Backend Validation (Second Line):
  ├─ Check business rules (e.g., unique username)
  ├─ Check data types and formats
  └─ IF validation fails → Return 400 with detailed error
↓
Frontend Displays Error:
  ├─ General errors → Snackbar
  └─ Field-specific errors → Inline error messages
```

---

## Visual Design Guidelines

### Swim Lane Layout

Create **6 horizontal swim lanes** representing different system components:

1. **EPC User Lane** (Light Blue)
   - Shows actions available to EPC business unit users
   - Includes: Exclusivity Form, Item Maintenance, Store Maintenance

2. **NBFI User Lane** (Light Green)
   - Shows actions available to NBFI business unit users
   - Includes: NBFI Exclusivity Form only

3. **Admin User Lane** (Light Purple)
   - Shows actions available to administrators
   - Includes: All forms, User Management, Audit Logs

4. **Frontend (React) Lane** (Light Orange)
   - Component rendering, state management, API calls
   - LocalStorage operations, routing logic

5. **Backend (Express API) Lane** (Light Yellow)
   - Route handlers, middleware, validation
   - JWT verification, business logic

6. **Database (MySQL) Lane** (Light Gray)
   - Table operations (SELECT, INSERT, UPDATE, DELETE)
   - Shows which tables are queried

### Color Coding

Use consistent colors throughout the flowchart:

| Color | Use Case | Hex Code |
|-------|----------|----------|
| 🟦 **Blue** | User actions and inputs | `#2196F3` |
| 🟨 **Yellow** | System processes and operations | `#FFC107` |
| 🟩 **Green** | Success states and confirmations | `#4CAF50` |
| 🟥 **Red** | Errors, validations failures, warnings | `#F44336` |
| 🟪 **Purple** | Admin-only actions | `#9C27B0` |
| 🟧 **Orange** | API calls and network operations | `#FF9800` |
| ⚫ **Gray** | Database operations | `#607D8B` |

### Symbol Legend

Include a legend showing:

| Symbol | Meaning | When to Use |
|--------|---------|-------------|
| **Rectangle** | Process/Action | Any operation or task |
| **Diamond** | Decision Point | Conditional logic (if/else) |
| **Cylinder** | Database Operation | Query, insert, update, delete |
| **Document** | Document/Report | Excel export, PDF generation |
| **Circle** | Start/End Point | Entry and exit points |
| **Parallelogram** | Input/Output | User input, API response |
| **Rounded Rectangle** | Subprocess | Reference to another flowchart |
| **Dashed Line** | Async Operation | Background processes, audit logs |

### Decision Points (Diamonds)

Every diamond must have:
- **Question** inside (e.g., "Is user.role === 'admin'?")
- **Two or more paths** labeled with answers (Yes/No, or specific values)
- **Clear outcomes** for each path

Examples:
```
         ╔══════════════════╗
         ║ Is user logged   ║
         ║ in?              ║
         ╚════╦═════════╦═══╝
              ║         ║
           YES║         ║NO
              ║         ║
         ╔════▼════╗ ╔══▼════════╗
         ║ Continue║ ║ Redirect  ║
         ║ to      ║ ║ to /login ║
         ║ Dashboard║ ╚═══════════╝
         ╚═════════╝
```

### Annotations

Add text annotations for:
- **Security checkpoints** - Mark with 🔒 icon
- **Audit log creation** - Mark with 📝 icon
- **External services** - Mark with 🌐 icon (e.g., Brevo email)
- **Important validations** - Mark with ✅ icon

---

## Mermaid Flowchart Code

Below is a Mermaid.js code example for the **Authentication Flow**. You can copy this into any Mermaid-compatible tool (Mermaid Live Editor, GitHub, Notion, etc.):

```mermaid
flowchart TD
    Start([User Visits System]) --> LoginCheck{Has Account?}
    
    %% Registration Flow
    LoginCheck -->|No| SignupPage[Navigate to Signup Page]
    SignupPage --> EnterDetails[Enter: Username, Email,<br/>Password, Role, Business Unit]
    EnterDetails --> AutoDetect{Email Domain?}
    AutoDetect -->|@barbizonfashion.com| SetNBFI[Auto-select NBFI]
    AutoDetect -->|@everydayproductscorp.com| SetEPC[Auto-select EPC]
    AutoDetect -->|Other| ManualSelect[Manual Selection Required]
    SetNBFI --> SubmitReg[Submit Registration]
    SetEPC --> SubmitReg
    ManualSelect --> SubmitReg
    
    SubmitReg --> ValidateReg{Validation<br/>Passes?}
    ValidateReg -->|No| RegError[Show Error Message]
    RegError --> SignupPage
    ValidateReg -->|Yes| HashPassword[Hash Password with bcrypt]
    HashPassword --> InsertUser[(INSERT INTO users)]
    InsertUser --> LogRegAudit[Log Audit: 'register']
    LogRegAudit --> RegSuccess[Registration Successful]
    RegSuccess --> RedirectLogin[Redirect to Login Page]
    
    %% Login Flow
    LoginCheck -->|Yes| LoginPage[Navigate to Login Page]
    RedirectLogin --> LoginPage
    LoginPage --> EnterCreds[Enter Username/Email<br/>and Password]
    EnterCreds --> SubmitLogin[Submit Login]
    SubmitLogin --> QueryUser[(SELECT FROM users<br/>WHERE username OR email)]
    QueryUser --> UserExists{User<br/>Exists?}
    UserExists -->|No| LoginError[Show: Invalid Credentials]
    LoginError --> LoginPage
    UserExists -->|Yes| VerifyPassword{Password<br/>Valid?}
    VerifyPassword -->|No| LoginError
    VerifyPassword -->|Yes| GenerateJWT[Generate JWT Token<br/>userId, username, role,<br/>businessUnit]
    GenerateJWT --> LogLoginAudit[Log Audit: 'login']
    LogLoginAudit --> StoreToken[Store Token & User<br/>in localStorage]
    StoreToken --> SmartRoute{User Role &<br/>Business Unit?}
    
    %% Smart Routing
    SmartRoute -->|Admin| AdminDash[Redirect to<br/>EPC Exclusivity Form]
    SmartRoute -->|EPC User| EPCDash[Redirect to<br/>EPC Exclusivity Form]
    SmartRoute -->|NBFI User| NBFIDash[Redirect to<br/>NBFI Exclusivity Form]
    
    AdminDash --> Dashboard[Dashboard Loads]
    EPCDash --> Dashboard
    NBFIDash --> Dashboard
    
    Dashboard --> ShowMenu[Display Filtered Menu<br/>Based on Role & Business Unit]
    ShowMenu --> End([User Accesses System])
    
    %% Styling
    classDef userAction fill:#2196F3,stroke:#1976D2,color:#fff
    classDef systemProcess fill:#FFC107,stroke:#FFA000,color:#000
    classDef success fill:#4CAF50,stroke:#388E3C,color:#fff
    classDef error fill:#F44336,stroke:#D32F2F,color:#fff
    classDef database fill:#607D8B,stroke:#455A64,color:#fff
    classDef decision fill:#FF9800,stroke:#F57C00,color:#fff
    
    class Start,LoginPage,SignupPage,EnterDetails,EnterCreds userAction
    class SubmitReg,SubmitLogin,HashPassword,GenerateJWT,StoreToken,ShowMenu systemProcess
    class RegSuccess,Dashboard,End success
    class RegError,LoginError error
    class QueryUser,InsertUser,LogRegAudit,LogLoginAudit database
    class LoginCheck,UserExists,VerifyPassword,SmartRoute,AutoDetect,ValidateReg decision
```

### How to Use Mermaid Code:

1. **Copy the code** from the fenced code block above
2. **Paste into one of these tools:**
   - [Mermaid Live Editor](https://mermaid.live/) - Free online editor
   - GitHub Markdown (supports Mermaid natively)
   - VS Code with Mermaid extension
   - Notion (supports Mermaid diagrams)
   - GitLab wikis
3. **Export as:**
   - PNG image
   - SVG vector
   - Markdown file
   - PDF (via print function)

### Additional Mermaid Flowcharts Needed

You can create separate Mermaid diagrams for:
- **Exclusivity Form Workflow** (filter selection → assign items → export)
- **User Management CRUD** (create, read, update, delete users)
- **Audit Logs Query** (filter → query → display)
- **Store Maintenance** (add stores → bulk import)

---

## Implementation Recommendations

### For Non-Technical End Users:

1. **Use Lucidchart or Draw.io** for visual diagram creation
   - Import swim lane templates
   - Drag and drop shapes
   - Export as PDF or PNG for documentation

2. **Color code by user type** to show different user journeys
   - Blue path: EPC users
   - Green path: NBFI users
   - Purple path: Admin users

3. **Create separate diagrams** for each major workflow
   - Don't try to fit everything in one diagram
   - Link diagrams together with "See: [Diagram Name]" annotations

### For Technical Users:

1. **Use Mermaid.js** for version-controlled diagrams
   - Store Mermaid code in Git repository
   - Renders automatically in GitHub/GitLab
   - Easy to update and maintain

2. **Create interactive diagrams** with tools like:
   - PlantUML (for sequence diagrams)
   - Graphviz (for complex relationships)
   - D3.js (for custom interactive visualizations)

3. **Generate diagrams from code** using:
   - TypeDoc (for TypeScript/JavaScript)
   - Sphinx (for Python with autodoc)
   - Database schema visualization tools

---

## Glossary for End Users

| Term | Definition |
|------|------------|
| **Business Unit** | Either EPC (Everyday Products Corp) or NBFI (Barbizon Fashion) - determines which data tables a user can access |
| **JWT Token** | JSON Web Token - a secure way to transmit user identity and permissions between frontend and backend |
| **Exclusivity** | Assignment of specific items to specific stores based on chain and store class combinations |
| **Chain** | A group of stores under the same brand (vChain, sMH, oH) |
| **Store Class** | Classification level of a store (ASEH, BSH, CSM, DSS, ESES) |
| **Audit Log** | A record of every action taken in the system (who did what, when, and from where) |
| **Role** | User permission level (Admin, Manager, Employee) |
| **Middleware** | Backend code that runs before processing a request (e.g., to verify login) |
| **Hashing** | One-way encryption used for passwords (cannot be reversed) |
| **localStorage** | Browser storage where login tokens are saved |
| **Snackbar** | Small popup notification that appears temporarily to show success/error messages |

---

## Support & Maintenance

**Document Maintained By:** Development Team  
**For Questions:** Contact system administrator  
**Last Reviewed:** November 13, 2025  
**Next Review:** Quarterly or upon major system changes

---

**End of Document**
