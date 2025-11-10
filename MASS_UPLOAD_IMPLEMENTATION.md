# Mass Upload Feature Implementation

## Overview
Added a mass upload functionality to the Item Maintenance page that allows bulk uploading of exclusivity items via Excel or CSV files.

## Changes Made

### Frontend (`frontend/src/components/ItemMaintenance.js`)

#### 1. Added Imports
- Added `CloudUpload` icon from Material-UI icons

#### 2. New State Variables
```javascript
const [openMassUploadModal, setOpenMassUploadModal] = useState(false);
const [uploadFile, setUploadFile] = useState(null);
const [uploadLoading, setUploadLoading] = useState(false);
const [uploadResults, setUploadResults] = useState(null);
```

#### 3. New Functions
- `handleOpenMassUploadModal()` - Opens the mass upload dialog
- `handleCloseMassUploadModal()` - Closes the dialog and resets state
- `handleFileChange()` - Handles file selection and validation
- `handleMassUpload()` - Uploads file to backend API
- `handleDownloadTemplate()` - Downloads a CSV template file

#### 4. UI Components
- **Mass Upload Button**: Added next to "Add Item" button
- **Mass Upload Modal**: Dialog with:
  - File upload area (drag & drop style)
  - Download template button
  - Upload results display (success/failed counts)
  - Failed items list with reasons

### Backend (`backend/routes/inventory.js`)

#### 1. Added Dependencies
```javascript
const multer = require('multer');
const XLSX = require('xlsx');
```

#### 2. Multer Configuration
```javascript
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
```

#### 3. New Endpoint
**Route**: `POST /api/inventory/mass-upload-exclusivity-items`

**Features**:
- Accepts Excel (.xlsx, .xls) or CSV files
- Parses file data using XLSX library
- **Automatically converts names to codes** using lookup maps
- Supports both full names (e.g., "VChain A") and codes (e.g., "vChainA") for flexibility
- Case-insensitive matching for all fields
- Validates required fields: Chain, Category, StoreClass, ItemCode
- Uses UPSERT logic (insert or update)
- Returns detailed results (success/failed rows)
- Logs audit trail for tracking
- Returns HTTP 200 (all success) or 207 (partial success)

**Name to Code Conversion**:
- **Chain**: "VChain A" → "vChainA"
- **Category**: "Food" → "food" 
- **StoreClass**: "Super Express Hyper" → "SEH"

**Expected File Format**:
| Chain          | Category  | StoreClass              | ItemCode |
|----------------|-----------|-------------------------|----------|
| VChain A       | Food      | Super Express Hyper     | ITEM001  |
| SM Hypermarket | Non-Food  | Bargain Super Hyper     | ITEM002  |
| Other Hyper    | Food      | SM                      | ITEM003  |

**Important:** Use the **full names** (not codes) in your Excel file. The system will automatically convert them to the appropriate codes.

## Installation Required

### Backend Package
You need to install the `xlsx` package in the backend:

```bash
cd backend
npm install xlsx
```

Or using the full npm path if needed:
```powershell
cd "c:\Users\roland\Documents\Web System\IEM\IEM\backend"
& "C:\Program Files\nodejs\npm.cmd" install xlsx
```

## How to Use

### For End Users:
1. Navigate to **Item Maintenance** page
2. Click **"Mass Upload"** button
3. (Optional) Click **"Download Template"** to get a sample CSV file
4. Click **"Choose File"** and select your Excel/CSV file
5. Click **"Upload"** button
6. View results showing successful and failed items
7. Failed items will display with specific error reasons

### File Requirements:
- **Format**: Excel (.xlsx, .xls) or CSV (.csv)
- **Size**: Maximum 10MB
- **Required Columns**: Chain, Category, StoreClass, ItemCode
- **Column Names**: Case-insensitive (can use Chain/chain/CHAIN)
- **Values**: Use full names (e.g., "VChain A", "Food", "Super Express Hyper")
- **Flexible Input**: The system accepts both names and codes for backwards compatibility

### Template Format:
```csv
Chain,Category,StoreClass,ItemCode
VChain A,Food,Super Express Hyper,ITEM001
SM Hypermarket,Non-Food,Bargain Super Hyper,ITEM002
Other Hyper,Food,SM,ITEM003
```

## Features

✅ **Validation**:
- File type validation (Excel/CSV only)
- Required field checking
- Row-by-row error tracking

✅ **User Feedback**:
- Success/failure counts
- Detailed error messages per row
- Loading indicators during upload

✅ **Error Handling**:
- Invalid file format detection
- Missing field notifications
- Database error capture
- Audit trail logging

✅ **Template Download**:
- Sample CSV template generation
- Proper format guidance

## API Response Format

```json
{
  "message": "File processed",
  "summary": {
    "total": 10,
    "success": 8,
    "failed": 2,
    "skipped": 0
  },
  "results": {
    "success": [
      {
        "row": 2,
        "itemCode": "ITEM001",
        "action": "inserted",
        "column": "vChainASEH"
      }
    ],
    "failed": [
      {
        "row": 5,
        "itemCode": "ITEM004",
        "reason": "Missing required fields"
      }
    ],
    "skipped": []
  }
}
```

## Testing Checklist

- [ ] Install xlsx package in backend
- [ ] Test with valid Excel file
- [ ] Test with valid CSV file
- [ ] Test with invalid file format
- [ ] Test with missing required columns
- [ ] Test with duplicate items (should update)
- [ ] Test with empty file
- [ ] Test file size limit (>10MB)
- [ ] Verify audit logs are created
- [ ] Verify item list refreshes after upload
- [ ] Test error display for failed items
- [ ] Test template download

## Notes

- The mass upload uses the same database logic as individual item addition
- Existing items will be updated (UPSERT behavior)
- All successful uploads are logged in the audit trail
- The feature supports both insert and update operations
- Column names are case-insensitive for user convenience
