# Export Failed Items Feature

## Overview
Added functionality to export failed upload items to an Excel file, allowing users to fix errors and re-upload the corrected data.

## Implementation

### Frontend Changes (`ItemMaintenance.js`)

#### 1. New Import
```javascript
import * as XLSX from 'xlsx';
import { FileDownloadIcon } from '@mui/icons-material';
```

#### 2. New Function: `handleExportFailedItems()`

**Purpose**: Exports failed items from mass upload to an Excel file

**Features**:
- Creates Excel file with failed items and error reasons
- Includes row numbers for easy reference
- Provides empty columns for Chain, Category, and StoreClass to be filled
- Shows ItemCode and Error Reason for each failed item
- Automatically generates filename with timestamp
- Shows success/error notifications

**Excel File Structure**:
| Column | Description | User Action Required |
|--------|-------------|---------------------|
| Row | Original row number from upload | Reference only |
| Chain | Chain name | **Fill this in** |
| Category | Category name | **Fill this in** |
| StoreClass | Store classification | **Fill this in** |
| ItemCode | Item code from failed upload | Review/correct if needed |
| Error Reason | Detailed error message | Read to understand issue |

**Column Widths**:
- Row: 8 characters
- Chain: 25 characters
- Category: 20 characters
- StoreClass: 30 characters
- ItemCode: 20 characters
- Error Reason: 50 characters

#### 3. UI Updates

**Export Button**:
- Location: Above the failed items list in upload results
- Style: Outlined error button with download icon
- Label: "Export Failed Items"
- Enabled: Only when there are failed items

**Enhanced Failed Items Display**:
- Header row with "Failed Items:" label and export button
- Scrollable list showing: Row number, ItemCode, and error reason
- Info alert with tip about exporting and fixing errors

**New Alert Message**:
```
Tip: Click "Export Failed Items" to download an Excel file with the errors.
Fix the data in Excel and upload it again.
```

## User Workflow

### Step-by-Step Process:

1. **User uploads file with errors**
   - Some items fail validation
   - Upload modal shows results summary

2. **View failed items**
   - Failed items list displays with reasons
   - Each item shows: Row number, ItemCode, and error

3. **Export failed items**
   - Click "Export Failed Items" button
   - Excel file downloads automatically
   - Filename format: `failed_items_YYYY-MM-DDTHH-MM-SS.xlsx`

4. **Fix errors in Excel**
   - Open downloaded file
   - Read error reasons in "Error Reason" column
   - Fill in Chain, Category, StoreClass columns
   - Correct ItemCode if needed
   - Save the file

5. **Re-upload corrected file**
   - Click "Choose File" in upload modal
   - Select the corrected Excel file
   - Click "Upload"
   - Successfully uploads fixed items

## Example Export File

### Before Export (Failed Upload Results):
```
Row 5: ITEM#004 - Invalid ItemCode format. Only letters, numbers, dash, and underscore allowed.
Row 8: ITEM007 - Invalid Chain: "Wrong Chain". Please use valid chain name or code.
Row 10: ITEM009 - Missing required fields (Chain, Category, StoreClass, or ItemCode)
```

### After Export (Excel File):
| Row | Chain | Category | StoreClass | ItemCode | Error Reason |
|-----|-------|----------|------------|----------|--------------|
| 5 | | | | ITEM#004 | Invalid ItemCode format... |
| 8 | | | | ITEM007 | Invalid Chain: "Wrong Chain"... |
| 10 | | | | ITEM009 | Missing required fields... |

### After User Fixes (Ready for Re-upload):
| Row | Chain | Category | StoreClass | ItemCode | Error Reason |
|-----|-------|----------|------------|----------|--------------|
| 5 | VChain A | Food | Super Express Hyper | ITEM004 | Invalid ItemCode format... |
| 8 | SM Hypermarket | Non-Food | Bargain Super Hyper | ITEM007 | Invalid Chain: "Wrong Chain"... |
| 10 | Other Hyper | Food | SM | ITEM009 | Missing required fields... |

**Note**: The "Row" and "Error Reason" columns are for reference only. Users only need to fill Chain, Category, StoreClass, and correct ItemCode.

## File Format

### Excel Specifications:
- **Format**: .xlsx (Excel 2007+)
- **Sheet Name**: "Failed Items"
- **Encoding**: UTF-8
- **Headers**: Bold (automatic via json_to_sheet)

### Filename Convention:
```
failed_items_YYYY-MM-DDTHH-MM-SS.xlsx

Example:
failed_items_2025-11-10T08-30-45.xlsx
```

## Benefits

### For Users:
✅ **No Manual Data Entry**: Failed items are already in Excel format
✅ **Clear Error Messages**: Each item shows specific validation error
✅ **Easy Correction**: Fill in missing/incorrect data directly in Excel
✅ **Quick Re-upload**: Use the same upload feature to retry
✅ **Reference Row Numbers**: Easy to cross-reference with original file
✅ **Professional Format**: Clean, formatted Excel file

### For System:
✅ **Reduces Support Burden**: Users can self-service error correction
✅ **Faster Resolution**: Users don't need to recreate failed items
✅ **Better UX**: Complete workflow from error to resolution
✅ **Audit Trail**: Users can keep failed items file for reference

## Technical Details

### Dependencies:
- **xlsx** (^0.18.5): Already installed in frontend
- Uses `XLSX.utils.json_to_sheet()` for data conversion
- Uses `XLSX.writeFile()` for file download

### Error Handling:
```javascript
try {
  // Export logic
  setSnackbar({
    open: true,
    message: `Exported ${failedData.length} failed item(s) to ${filename}`,
    severity: 'success'
  });
} catch (error) {
  console.error('Error exporting failed items:', error);
  setSnackbar({
    open: true,
    message: 'Failed to export file',
    severity: 'error'
  });
}
```

### Validation:
- Checks if uploadResults exists
- Checks if failed items array has items
- Shows info message if no failed items to export

## User Guide

### How to Use Export Failed Items:

1. **Upload Your File**
   - Use Mass Upload feature
   - Wait for processing to complete

2. **Check Results**
   - Green alert: All items succeeded ✓
   - Yellow/Orange alert: Some items failed ⚠️
   - Red alert: All items failed ✗

3. **If Items Failed**:
   - Scroll down to "Failed Items" section
   - Review error reasons
   - Click "Export Failed Items" button

4. **Fix the Excel File**:
   - Open downloaded file
   - Fill in Chain column (use names from legend)
   - Fill in Category column (use names from legend)
   - Fill in StoreClass column (use names from legend)
   - Correct ItemCode if format is invalid
   - Remove "Row" and "Error Reason" columns (optional)
   - Save the file

5. **Re-upload Corrected File**:
   - Click "Choose File" again
   - Select your corrected file
   - Click "Upload"
   - Verify all items now succeed

### Common Fixes:

| Error Reason | How to Fix |
|--------------|------------|
| Missing required fields | Fill in all empty columns |
| Invalid Chain | Use chain name from legend (e.g., "VChain A") |
| Invalid Category | Use category name from legend (e.g., "Food") |
| Invalid Store Class | Use store class from legend (e.g., "Super Express Hyper") |
| Invalid ItemCode format | Remove special characters (@, #, ., spaces) |
| Invalid combination | Check valid chain + store class combinations |

## Testing Checklist

- [ ] Export with 1 failed item
- [ ] Export with multiple failed items
- [ ] Export with no failed items (should show info message)
- [ ] Verify Excel file downloads correctly
- [ ] Verify Excel file has correct headers
- [ ] Verify Excel file has correct data
- [ ] Verify column widths are appropriate
- [ ] Fill in exported file and re-upload
- [ ] Verify re-upload succeeds
- [ ] Test on different browsers (Chrome, Firefox, Edge)
- [ ] Test with different error types
- [ ] Verify filename has timestamp
- [ ] Verify snackbar notifications work

## Notes

- The export includes the original row number for reference
- Users can delete the "Row" and "Error Reason" columns before re-uploading (optional)
- The system will accept the file with or without these extra columns
- Column names in re-upload are case-insensitive (Chain/chain/CHAIN all work)
- Empty columns must be filled before re-uploading
