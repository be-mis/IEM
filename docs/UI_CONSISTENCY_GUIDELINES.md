# UI Consistency Guidelines

## Overview
This document outlines the UI/UX patterns and component standards for the IEM (Item Exclusivity Management) system to ensure consistency across all modules.

**Last Updated:** November 4, 2025

---

## 1. Modal Dialogs (Add/Edit Forms)

### Standard Behavior
All modal dialogs for adding or editing data must follow these patterns:

#### 1.1 Modal Properties
```jsx
<Dialog 
  open={openModal} 
  onClose={() => {}}  // Prevent closing by clicking outside
  disableEscapeKeyDown // Prevent closing with ESC key
  maxWidth="md" 
  fullWidth
>
```

**Rationale:** Prevents accidental data loss from clicking outside or pressing ESC.

#### 1.2 Close Button Behavior
- The "Cancel" or "Close" button must check for unsaved data
- If form has data or items have been added to a list, show confirmation dialog
- If no data exists, close immediately

```jsx
const handleCloseModal = () => {
  const hasFormData = form.field1 || form.field2 || form.field3;
  const hasAddedItems = addedItems.length > 0;
  
  if (hasFormData || hasAddedItems) {
    setOpenCloseConfirmDialog(true);
    return;
  }
  
  setOpenModal(false);
};
```

#### 1.3 Confirmation Dialog
Use consistent MUI Dialog for close confirmation:

```jsx
<Dialog open={openCloseConfirmDialog} onClose={handleCancelClose}>
  <DialogTitle>Confirm Close</DialogTitle>
  <DialogContent>
    <DialogContentText>
      You have unsaved data. All inputs and added items will be cleared. Do you want to continue?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCancelClose} color="inherit">
      No
    </Button>
    <Button onClick={handleConfirmClose} color="primary" variant="contained">
      Yes
    </Button>
  </DialogActions>
</Dialog>
```

#### 1.4 Required State Variables
```jsx
const [openModal, setOpenModal] = useState(false);
const [openCloseConfirmDialog, setOpenCloseConfirmDialog] = useState(false);
const [formData, setFormData] = useState({/* fields */});
const [addedItems, setAddedItems] = useState([]);
```

---

## 2. Form Layouts

### 2.1 Grid Structure
Use Material-UI Grid for responsive layouts:

```jsx
<Grid container spacing={2} sx={{ mt: 1 }}>
  <Grid item xs={12} md={6}>
    {/* Form field */}
  </Grid>
  <Grid item xs={12} md={6}>
    {/* Form field */}
  </Grid>
</Grid>
```

### 2.2 Form Controls
- Use `size="small"` for compact appearance
- Always include `label` prop
- Use consistent field names across the system

```jsx
<FormControl fullWidth size="small">
  <InputLabel>Field Name</InputLabel>
  <Select value={value} onChange={handleChange} label="Field Name">
    <MenuItem value="">Select Option</MenuItem>
    {options.map(option => (
      <MenuItem key={option.id} value={option.code}>
        {option.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
```

### 2.3 Autocomplete Fields
For searchable dropdowns with many options:

```jsx
<Autocomplete
  size="small"
  options={options}
  getOptionLabel={(option) => `${option.code} - ${option.name}`}
  value={selectedValue}
  onChange={(event, newValue) => handleChange(newValue)}
  disabled={!prerequisiteSelected}
  loading={isLoading}
  filterOptions={(options, { inputValue }) => {
    const query = inputValue.toLowerCase();
    return options.filter(option => 
      option.code.toLowerCase().includes(query) ||
      option.name.toLowerCase().includes(query)
    );
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      label="Field Name"
      placeholder="Search by code or name"
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
    />
  )}
/>
```

---

## 3. Action Buttons

### 3.1 Primary Actions (Add to List / Submit)
- Use `variant="contained"` and `color="primary"`
- Place on the left side in button groups
- Disable when required fields are empty

```jsx
<Button
  variant="contained"
  color="primary"
  fullWidth
  onClick={handleAdd}
  disabled={!field1 || !field2 || !field3}
>
  Add to List
</Button>
```

### 3.2 Secondary Actions (Clear)
- Use `variant="outlined"` and `color="secondary"`
- Place next to primary action button
- Fixed minimum width for consistency

```jsx
<Button
  variant="outlined"
  color="secondary"
  onClick={handleClear}
  sx={{ minWidth: '120px' }}
>
  Clear
</Button>
```

### 3.3 Button Layout
Use Stack for horizontal button groups:

```jsx
<Stack direction="row" spacing={2}>
  <Button variant="contained" color="primary" fullWidth>
    Primary Action
  </Button>
  <Button variant="outlined" color="secondary" sx={{ minWidth: '120px' }}>
    Secondary Action
  </Button>
</Stack>
```

---

## 4. Data Tables

### 4.1 Added Items Table
Display items that have been added but not yet saved:

```jsx
{addedItems.length > 0 && (
  <Box sx={{ mt: 4 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>
      Added Items
    </Typography>
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><strong>Column 1</strong></TableCell>
            <TableCell><strong>Column 2</strong></TableCell>
            <TableCell align="center"><strong>Action</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {addedItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.field1}</TableCell>
              <TableCell>{item.field2}</TableCell>
              <TableCell align="center">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(item.id)}
                >
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
)}
```

**Key Points:**
- Use `variant="outlined"` for TableContainer
- Use `<strong>` tags in TableHead cells
- Use `size="small"` for compact display
- Use `Typography variant="h6"` for section title with `sx={{ mb: 2 }}`

### 4.2 Main Data Tables
For the main data display (not added items):

```jsx
<TableContainer sx={{ height: 560 }}>
  <Table stickyHeader>
    <TableHead>
      <TableRow>
        {columns.map((col) => (
          <TableCell
            key={col.id}
            sx={{ fontWeight: 'bold' }}
            style={{ minWidth: col.minWidth }}
          >
            {col.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {/* Table rows */}
    </TableBody>
  </Table>
</TableContainer>
```

---

## 5. Display Values vs. Stored Values

### 5.1 Dropdown Display
Always show **descriptions/names** in the UI, not codes:

**Good:**
```jsx
<MenuItem key={chain.chainCode} value={chain.chainCode}>
  {chain.chainName}  {/* Show name only */}
</MenuItem>
```

**Bad:**
```jsx
<MenuItem key={chain.chainCode} value={chain.chainCode}>
  {chain.chainCode} - {chain.chainName}  {/* Don't show code in UI */}
</MenuItem>
```

### 5.2 Table Display
Store both codes and descriptions when adding items to list:

```jsx
const newItem = {
  // Codes for API
  chain: formData.chain,
  category: formData.category,
  storeClass: formData.storeClass,
  
  // Descriptions for display
  chainName: chains.find(c => c.chainCode === formData.chain)?.chainName,
  categoryName: categories.find(c => c.code === formData.category)?.name,
  storeClassName: storeClasses.find(s => s.code === formData.storeClass)?.name,
  
  // Other fields
  itemCode: selectedItem.itemCode,
  itemName: selectedItem.itemName,
  id: Date.now()
};
```

Display descriptions in table:
```jsx
<TableCell>{item.chainName || item.chain}</TableCell>
<TableCell>{item.categoryName || item.category}</TableCell>
<TableCell>{item.storeClassName || item.storeClass}</TableCell>
```

---

## 6. Dialog Actions (Footer Buttons)

### 6.1 Standard Layout
```jsx
<DialogActions>
  <Button onClick={handleClose} color="inherit">
    Cancel
  </Button>
  <Button 
    variant="contained" 
    color="primary"
    disabled={addedItems.length === 0 || loading}
    onClick={handleSave}
  >
    {loading ? 'Saving...' : `Save All (${addedItems.length})`}
  </Button>
</DialogActions>
```

**Key Points:**
- Cancel button: `color="inherit"` (no variant)
- Save button: `variant="contained"` and `color="primary"`
- Show loading state with text change
- Display count in button text

---

## 7. Loading States

### 7.1 Form Loading
```jsx
{loading && (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
    <CircularProgress />
  </Box>
)}
```

### 7.2 Button Loading
```jsx
<Button disabled={loading}>
  {loading ? 'Saving...' : 'Save'}
</Button>
```

### 7.3 Autocomplete Loading
```jsx
<Autocomplete
  loading={isLoading}
  InputProps={{
    endAdornment: (
      <>
        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
        {params.InputProps.endAdornment}
      </>
    ),
  }}
/>
```

---

## 8. Error Handling

### 8.1 Inline Errors
```jsx
{error && (
  <Alert severity="error" sx={{ m: 2 }}>
    {error}
  </Alert>
)}
```

### 8.2 Snackbar Notifications (Optional)
For transient feedback messages:

```jsx
<Snackbar
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={handleCloseSnackbar}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert 
    onClose={handleCloseSnackbar} 
    severity={snackbar.severity}
    variant="filled"
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
```

---

## 9. Component Structure Template

```jsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Box, Paper, Dialog, DialogTitle, DialogContent, DialogContentText, 
  DialogActions, Button, Grid, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  IconButton, Typography, Stack, CircularProgress, Alert, Autocomplete, TextField
} from '@mui/material';
import { DeleteForever as DeleteForeverIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function ComponentName() {
  // State management
  const [openModal, setOpenModal] = useState(false);
  const [openCloseConfirmDialog, setOpenCloseConfirmDialog] = useState(false);
  const [formData, setFormData] = useState({/* fields */});
  const [addedItems, setAddedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal handlers
  const handleOpenModal = () => {
    setOpenModal(true);
    setFormData({/* reset */});
  };

  const handleCloseModal = () => {
    const hasFormData = formData.field1 || formData.field2;
    const hasAddedItems = addedItems.length > 0;
    
    if (hasFormData || hasAddedItems) {
      setOpenCloseConfirmDialog(true);
      return;
    }
    
    setOpenModal(false);
  };

  const handleConfirmClose = () => {
    setOpenCloseConfirmDialog(false);
    setOpenModal(false);
    setFormData({/* reset */});
    setAddedItems([]);
  };

  const handleCancelClose = () => {
    setOpenCloseConfirmDialog(false);
  };

  const handleClearForm = () => {
    setFormData({/* reset */});
  };

  const handleAddToList = () => {
    // Validation
    // Add item to list
    // Clear form (optional)
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      // API call
      // Success handling
      setAddedItems([]);
      handleConfirmClose();
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Main content */}
      
      {/* Add Modal */}
      <Dialog 
        open={openModal} 
        onClose={() => {}}
        disableEscapeKeyDown
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Form fields */}
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleAddToList}
                  disabled={!formData.field1}
                >
                  Add to List
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleClearForm}
                  sx={{ minWidth: '120px' }}
                >
                  Clear
                </Button>
              </Stack>
            </Grid>
            
            {/* Added Items Table */}
            {addedItems.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Added Items
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Column</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Table rows */}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={addedItems.length === 0 || loading}
            onClick={handleSaveAll}
          >
            {loading ? 'Saving...' : `Save All (${addedItems.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <Dialog open={openCloseConfirmDialog} onClose={handleCancelClose}>
        <DialogTitle>Confirm Close</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved data. All inputs and added items will be cleared. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="inherit">
            No
          </Button>
          <Button onClick={handleConfirmClose} color="primary" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
```

---

## 10. Implementation Checklist

When creating a new modal/form component, ensure:

- [ ] Modal has `onClose={() => {}}` and `disableEscapeKeyDown`
- [ ] Close button checks for unsaved data before closing
- [ ] Confirmation dialog implemented for unsaved data
- [ ] Clear button separate from Add to List button
- [ ] Buttons use correct variants and colors
- [ ] Dropdowns show descriptions, not codes
- [ ] Added items table shows descriptions
- [ ] Table headers use `<strong>` tags
- [ ] Loading states implemented
- [ ] Error handling in place
- [ ] Form fields have proper validation
- [ ] Consistent spacing (mt, mb, p values)

---

## 11. Currently Implemented Components

### ✅ ItemMaintenance.js
- Full modal behavior with confirmation
- Clear button functionality
- Descriptions displayed in dropdowns and tables
- Consistent table styling

### ✅ StoreMaintenance.js
- Full modal behavior with confirmation
- Clear button functionality
- Descriptions displayed in dropdowns and tables
- Consistent table styling

---

## 12. Future Development

**All new components must follow these guidelines to maintain consistency.**

If you discover patterns that should be added to this document, please update it and increment the version number.

**Document Version:** 1.0
**Last Updated:** November 4, 2025
