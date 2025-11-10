# Mass Upload Validation Rules

## Overview
The mass upload feature includes comprehensive validation at multiple levels to ensure data integrity and provide clear error messages to users.

## Validation Levels

### 1. **Frontend Validations** (Before Upload)

#### File Type Validation
- **Rule**: Only Excel (.xlsx, .xls) or CSV (.csv) files are accepted
- **Error Message**: "Please upload a valid Excel or CSV file"
- **Action**: File is rejected, user must select a different file

#### File Size Validation
- **Rule**: Maximum file size is 10MB
- **Error Message**: "File size exceeds 10MB limit. Please upload a smaller file."
- **Action**: File is rejected, file input is reset

### 2. **Backend Validations** (During Upload)

#### File Upload Validation
- **Rule**: File must be uploaded with the request
- **Error Message**: "No file uploaded"
- **HTTP Status**: 400 Bad Request

#### File Parse Validation
- **Rule**: File must be a valid Excel/CSV format that can be parsed
- **Error Message**: "Failed to parse file. Please ensure it is a valid Excel or CSV file."
- **HTTP Status**: 400 Bad Request
- **Details**: Includes parse error message

#### Empty File Validation
- **Rule**: File must contain at least one data row (excluding headers)
- **Error Message**: "File is empty or has no valid data"
- **HTTP Status**: 400 Bad Request

### 3. **Row-Level Validations** (For Each Row)

#### Required Fields Validation
- **Rule**: All 4 fields must be present (Chain, Category, StoreClass, ItemCode)
- **Error Message**: "Missing required fields (Chain, Category, StoreClass, or ItemCode)"
- **Action**: Row is skipped, added to failed list

#### Whitespace Validation
- **Rule**: Fields cannot be empty or contain only whitespace
- **Error Message**: "One or more fields contain only whitespace"
- **Action**: Row is skipped, added to failed list

#### ItemCode Format Validation
- **Rule**: ItemCode must contain only:
  - Letters (A-Z, a-z)
  - Numbers (0-9)
  - Dash (-)
  - Underscore (_)
- **Regex Pattern**: `/^[A-Z0-9_-]+$/i`
- **Error Message**: "Invalid ItemCode format. Only letters, numbers, dash, and underscore are allowed."
- **Action**: Row is skipped, added to failed list
- **Examples**:
  - ✅ Valid: `ITEM001`, `ITEM-001`, `ITEM_001`, `ABC123`
  - ❌ Invalid: `ITEM#001`, `ITEM 001`, `ITEM@001`, `ITEM.001`

#### Chain Validation
- **Rule**: Chain name or code must exist in the database
- **Lookup**: Case-insensitive matching against `epc_chains` table
- **Error Message**: `Invalid Chain: "<input>". Please use valid chain name or code.`
- **Action**: Row is skipped, added to failed list
- **Accepts**: Both full names ("VChain A") and codes ("vChainA")

#### Category Validation
- **Rule**: Category name must exist in the database
- **Lookup**: Case-insensitive matching against `epc_categories` table
- **Error Message**: `Invalid Category: "<input>". Please use valid category name.`
- **Action**: Row is skipped, added to failed list
- **Accepts**: Category names (e.g., "Food", "Non-Food")

#### Store Class Validation
- **Rule**: Store classification name or code must exist in the database
- **Lookup**: Case-insensitive matching against `epc_store_class` table
- **Error Message**: `Invalid Store Class: "<input>". Please use valid store classification or code.`
- **Action**: Row is skipped, added to failed list
- **Accepts**: Both full names ("Super Express Hyper") and codes ("SEH")

#### Database Column Validation
- **Rule**: The combination of Chain + StoreClass must form a valid database column
- **Check**: Verifies column exists in `epc_item_exclusivity_list` table
- **Error Message**: `Invalid combination: Column "<columnName>" does not exist in database. Chain "<chain>" and StoreClass "<storeClass>" cannot be combined.`
- **Action**: Row is skipped, added to failed list
- **Purpose**: Prevents invalid chain/store class combinations

### 4. **Database Operation Validation**

#### Upsert Validation
- **Rule**: Each valid row is inserted or updated using UPSERT logic
- **Error Handling**: Any database errors are caught and logged
- **Error Message**: Specific database error message is included in failed results
- **Action**: Row is skipped, added to failed list

## Validation Flow

```
1. User selects file
   ↓
2. Frontend validates:
   - File type (.xlsx, .xls, .csv)
   - File size (≤10MB)
   ↓
3. User clicks Upload
   ↓
4. Backend validates:
   - File received
   - File can be parsed
   - File has data
   ↓
5. Load lookup data from database
   ↓
6. For each row:
   - Extract fields (case-insensitive)
   - Trim whitespace
   - Validate not empty
   - Validate ItemCode format
   - Convert names to codes
   - Validate chain exists
   - Validate category exists
   - Validate store class exists
   - Validate column exists
   - Attempt database insert/update
   ↓
7. Return results:
   - Success count
   - Failed count (with reasons)
   - Detailed failed list
```

## Error Response Format

### Successful Upload (All Rows Valid)
```json
{
  "message": "File processed",
  "summary": {
    "total": 10,
    "success": 10,
    "failed": 0,
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
    "failed": [],
    "skipped": []
  }
}
```

### Partial Success (Some Rows Failed)
```json
{
  "message": "File processed",
  "summary": {
    "total": 10,
    "success": 7,
    "failed": 3,
    "skipped": 0
  },
  "results": {
    "success": [...],
    "failed": [
      {
        "row": 5,
        "itemCode": "ITEM#004",
        "reason": "Invalid ItemCode format. Only letters, numbers, dash, and underscore are allowed."
      },
      {
        "row": 8,
        "itemCode": "ITEM007",
        "reason": "Invalid Chain: \"Wrong Chain\". Please use valid chain name or code."
      },
      {
        "row": 10,
        "itemCode": "ITEM009",
        "reason": "Missing required fields (Chain, Category, StoreClass, or ItemCode)"
      }
    ],
    "skipped": []
  }
}
```

## User Feedback

### Success Messages
- **All Success**: "Successfully uploaded X item(s)!"
- **Partial Success**: "Successfully uploaded X item(s)! Y failed."
- **No Success**: "Upload completed but no items were added"

### Error Messages
- **File Type**: "Please upload a valid Excel or CSV file"
- **File Size**: "File size exceeds 10MB limit. Please upload a smaller file."
- **Parse Error**: "Failed to upload file" (with server error details)
- **No File**: "Please select a file to upload"

### Failed Items Display
- Shows in a scrollable list within the upload modal
- Each failure includes:
  - Row number (for easy reference in Excel)
  - Item code (if available)
  - Specific reason for failure

## Best Practices for Users

### To Avoid Validation Errors:

1. **Use the Template**: Download and use the provided template
2. **Use Full Names**: Use actual names from the legend, not codes
3. **Check Spelling**: Ensure names match exactly (case-insensitive)
4. **No Special Characters**: Use only letters, numbers, dash, and underscore in ItemCode
5. **No Empty Rows**: Remove empty rows from your file
6. **Complete Data**: Fill in all 4 columns for each row
7. **Valid Combinations**: Ensure Chain + StoreClass combinations are valid
8. **File Size**: Keep files under 10MB

### Common Validation Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| Missing required fields | Empty cell(s) | Fill all columns |
| Invalid Chain | Misspelled or non-existent | Use name from legend |
| Invalid Category | Misspelled or non-existent | Use name from legend |
| Invalid Store Class | Misspelled or non-existent | Use name from legend |
| Invalid ItemCode format | Special characters | Remove special chars |
| Invalid combination | Chain + StoreClass not compatible | Check valid combinations |
| File too large | File > 10MB | Split into smaller files |

## Audit Trail

All successful uploads are logged with:
- User information (if authenticated)
- IP address
- Timestamp
- File name
- Total rows processed
- Success/failure counts
- Individual item codes and columns affected

## Performance Considerations

- **Row Limit**: While no hard limit, files should be reasonable size (<10MB)
- **Processing**: Rows are processed sequentially to maintain data integrity
- **Partial Success**: Even if some rows fail, successful rows are still saved
- **Rollback**: Failed rows do not affect successful rows (row-level isolation)

## Security

- ✅ File type validation (prevents malicious files)
- ✅ File size limit (prevents DoS attacks)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input sanitization (trimming, validation)
- ✅ Error message safety (no sensitive data exposure)
- ✅ Audit logging (full traceability)
