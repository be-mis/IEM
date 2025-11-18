import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box, Paper, TextField, IconButton, Table, TableBody, TableContainer, TableHead,
  TableRow, TableCell, TablePagination, InputAdornment, Grid, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Checkbox, Stack, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Typography, Autocomplete, Snackbar
} from '@mui/material';
import {
  TuneOutlined, Search as SearchIcon, Clear as ClearIcon,
  DeleteForever as DeleteForeverIcon, Add as AddIcon, CloudUpload as CloudUploadIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import Filter from '../components/Filter';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const columns = [
  { id: 'select', label: '', width: 50 },
  { id: 'itemCode', label: 'Item Code', width: 200 },
  { id: 'description', label: 'Description', width: 600 },
  // { id: 'quantity', label: 'Quantity', width: 200 },
  { id: 'action', label: 'Action', width: 120 }
];

function createData(itemCode, description, quantity) {
  return { itemCode, description, quantity };
}

const rowKey = (r) => `${r.itemCode}|${r.description}`;

export default function ItemMaintenance() {
  const [rowsState, setRowsState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({
    chain: '',
    category: '',
    storeClass: '',
    transaction: ''
  });
  
  // Snackbar state for showing save feedback (consistent with ExclusivityForm)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'info' | 'warning'
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [quantities, setQuantities] = useState({});
  
  // Pagination for added items table in modal
  const [addedItemsPage, setAddedItemsPage] = useState(0);
  const [addedItemsRowsPerPage, setAddedItemsRowsPerPage] = useState(5);

  // Selection + delete dialog states
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('single'); // 'single' or 'multiple'
  const [selectedRow, setSelectedRow] = useState(null);

  // Add Item Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openCloseConfirmDialog, setOpenCloseConfirmDialog] = useState(false);
  const [addItemForm, setAddItemForm] = useState({
    chain: '',
    category: '',
    storeClass: '',
    itemNumber: ''
  });
  const [availableItems, setAvailableItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [addedItems, setAddedItems] = useState([]);
  
  // Fetch data for dropdowns in add modal
  const [chains, setChains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeClasses, setStoreClasses] = useState([]);

  // Mass Upload Modal states
  const [openMassUploadModal, setOpenMassUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Fetch items from API
  const fetchItems = async () => {
    const { chain, category, storeClass } = filterValues;
    
    // Only fetch if all required filters are selected
    if (!chain || !category || !storeClass) {
      setRowsState([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/filters/items`, {
        params: {
          chain,
          category,
          storeClass
        }
      });

      const items = response.data.items || [];
      
      // Transform API data to match table format
      const transformedItems = items.map(item => 
        createData(
          item.itemCode,
          item.itemDescription,
          item.quantity || 0
        )
      );

      setRowsState(transformedItems);
      
      // Initialize quantities
      const newQuantities = Object.fromEntries(
        transformedItems.map((r) => [rowKey(r), Number(r.quantity) ?? 0])
      );
      setQuantities(newQuantities);
      
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch items');
      setRowsState([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch items when filters change
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.chain, filterValues.category, filterValues.storeClass]);

  // Handle filter changes (memoized to prevent infinite re-renders)
  const handleFilterChange = useCallback((filters) => {
    setFilterValues(filters);
    setPage(0); // Reset to first page when filters change
  }, []);

  // Handle snackbar close
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  // Fetch dropdown data for add modal
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [chainsRes, categoriesRes, storeClassesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/filters/chains`),
          axios.get(`${API_BASE_URL}/filters/categories`),
          axios.get(`${API_BASE_URL}/filters/store-classes`)
        ]);
        
        setChains(chainsRes.data.items || []);
        setCategories(categoriesRes.data.items || []);
        setStoreClasses(storeClassesRes.data.items || []);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };
    
    fetchDropdownData();
  }, []);

  // Fetch available items based on selected filters in add modal
  const fetchAvailableItems = async () => {
    const { chain, category, storeClass } = addItemForm;
    
    if (!chain || !category || !storeClass) {
      setAvailableItems([]);
      return;
    }

    try {
      setLoadingItems(true);
      
      // Use the new specific endpoint for item assignment
      const response = await axios.get(`${API_BASE_URL}/filters/items-for-assignment`, {
        params: {
          chain,
          category,
          storeClass
        }
      });

      setAvailableItems(response.data.items || []);
      console.log(`Loaded ${response.data.items?.length || 0} available items for assignment`);
    } catch (err) {
      console.error('Error fetching available items:', err);
      setAvailableItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  // Fetch available items when form changes
  useEffect(() => {
    if (addItemForm.chain && addItemForm.category && addItemForm.storeClass) {
      fetchAvailableItems();
    } else {
      setAvailableItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addItemForm.chain, addItemForm.category, addItemForm.storeClass]);

  // Filter available items to exclude already added items with same chain, category, and storeClass
  const filteredAvailableItems = useMemo(() => {
    const { chain, category, storeClass } = addItemForm;
    
    if (!chain || !category || !storeClass) {
      return availableItems;
    }

    // Get item codes that are already added with the same chain, category, and storeClass
    const addedItemCodes = addedItems
      .filter(item => 
        item.chain === chain && 
        item.category === category && 
        item.storeClass === storeClass
      )
      .map(item => item.itemCode);

    // Filter out already added items
    return availableItems.filter(item => !addedItemCodes.includes(item.itemCode));
  }, [availableItems, addedItems, addItemForm.chain, addItemForm.category, addItemForm.storeClass]);

  // Ensure no background element retains focus when opening modals
  const blurActiveElement = () => {
    if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  };

  // Mass Upload Handlers
  const handleOpenMassUploadModal = () => {
    blurActiveElement();
    setOpenMassUploadModal(true);
    setUploadFile(null);
    setUploadResults(null);
  };

  const handleCloseMassUploadModal = () => {
    setOpenMassUploadModal(false);
    setUploadFile(null);
    setUploadResults(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndSetFile(file);
      event.target.value = null; // Reset file input
    }
  };

  const validateAndSetFile = (file) => {
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setSnackbar({
        open: true,
        message: 'File size exceeds 10MB limit. Please upload a smaller file.',
        severity: 'error'
      });
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setSnackbar({
        open: true,
        message: 'Please upload a valid Excel or CSV file',
        severity: 'error'
      });
      return;
    }
    
    setUploadFile(file);
    setUploadResults(null);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleMassUpload = async () => {
    if (!uploadFile) {
      setSnackbar({
        open: true,
        message: 'Please select a file to upload',
        severity: 'warning'
      });
      return;
    }

    try {
      setUploadLoading(true);
      
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await axios.post(`${API_BASE_URL}/inventory/mass-upload-exclusivity-items`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadResults(response.data);
      
      if (response.data.summary.success > 0) {
        setSnackbar({
          open: true,
          message: `Successfully uploaded ${response.data.summary.success} item(s)!${response.data.summary.failed > 0 ? ` ${response.data.summary.failed} failed.` : ''}`,
          severity: response.data.summary.failed > 0 ? 'warning' : 'success'
        });
        
        // Refresh the items list
        await fetchItems();
      } else {
        setSnackbar({
          open: true,
          message: 'Upload completed but no items were added',
          severity: 'warning'
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to upload file',
        severity: 'error'
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a sample Excel template with actual data from dropdowns
    const headers = ['Chain', 'Category', 'StoreClass', 'ItemCode'];
    const sampleData = [];
    
    // Add sample rows using actual names from the dropdown data
    if (chains.length > 0 && categories.length > 0 && storeClasses.length > 0) {
      sampleData.push({
        'Chain': chains[0]?.chainName || 'Chain Name',
        'Category': categories[0]?.category || 'Category Name',
        'StoreClass': storeClasses[0]?.storeClassification || 'Store Classification',
        'ItemCode': 'ITEM001'
      });
      
      if (chains.length > 1 && categories.length > 1 && storeClasses.length > 1) {
        sampleData.push({
          'Chain': chains[1]?.chainName || 'Chain Name',
          'Category': categories[1]?.category || 'Category Name',
          'StoreClass': storeClasses[1]?.storeClassification || 'Store Classification',
          'ItemCode': 'ITEM002'
        });
      }
    } else {
      // Fallback if data not loaded
      sampleData.push({
        'Chain': 'Chain Name',
        'Category': 'Category Name',
        'StoreClass': 'Store Classification',
        'ItemCode': 'ITEM001'
      });
      sampleData.push({
        'Chain': 'Chain Name',
        'Category': 'Category Name',
        'StoreClass': 'Store Classification',
        'ItemCode': 'ITEM002'
      });
    }
    
    // Create Excel workbook using XLSX library for proper encoding
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 25 }, // Chain
      { wch: 20 }, // Category
      { wch: 30 }, // StoreClass
      { wch: 15 }  // ItemCode
    ];

    // Force all cells to be text format to prevent Excel auto-formatting
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;
        
        // Set cell type to string and add text format
        ws[cellAddress].t = 's'; // 's' = string type
        if (!ws[cellAddress].z) ws[cellAddress].z = '@'; // '@' = text format
      }
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Generate filename
    const filename = 'mass_upload_template.xlsx';

    // Export file as Excel with text formatting
    XLSX.writeFile(wb, filename, { cellStyles: true });
  };

  const handleExportFailedItems = () => {
    if (!uploadResults || !uploadResults.results.failed || uploadResults.results.failed.length === 0) {
      setSnackbar({
        open: true,
        message: 'No failed items to export',
        severity: 'info'
      });
      return;
    }

    try {
      // Prepare data for Excel export
      const failedData = uploadResults.results.failed.map(item => ({
        'Row': item.row || 'N/A',
        'Chain': '', // User needs to fill this
        'Category': '', // User needs to fill this
        'StoreClass': '', // User needs to fill this
        'ItemCode': item.itemCode || '',
        'Error Reason': item.reason || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(failedData);

      // Set column widths
      ws['!cols'] = [
        { wch: 8 },  // Row
        { wch: 25 }, // Chain
        { wch: 20 }, // Category
        { wch: 30 }, // StoreClass
        { wch: 20 }, // ItemCode
        { wch: 50 }  // Error Reason
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Failed Items');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `failed_items_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(wb, filename);

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
  };

  // Handle Add Modal
  const handleOpenAddModal = () => {
    blurActiveElement();
    setOpenAddModal(true);
    setAddItemForm({
      chain: '',
      category: '',
      storeClass: '',
      itemNumber: ''
    });
  };

  const handleCloseAddModal = () => {
    // Check if there's any data in the form or added items
    const hasFormData = addItemForm.chain || addItemForm.category || addItemForm.storeClass || addItemForm.itemNumber;
    const hasAddedItems = addedItems.length > 0;
    
    if (hasFormData || hasAddedItems) {
      // Show confirmation dialog
      setOpenCloseConfirmDialog(true);
      return;
    }
    
    // No data, just close
    setOpenAddModal(false);
  };

  const handleConfirmCloseAddModal = () => {
    // Clear everything and close
    setOpenCloseConfirmDialog(false);
    setOpenAddModal(false);
    setAddItemForm({
      chain: '',
      category: '',
      storeClass: '',
      itemNumber: ''
    });
    setAddedItems([]);
  };

  const handleCancelCloseAddModal = () => {
    setOpenCloseConfirmDialog(false);
  };

  const handleAddItemFormChange = (field) => (event) => {
    const value = event.target.value;
    setAddItemForm(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields
      ...(field === 'chain' && { category: '', storeClass: '', itemNumber: '' }),
      ...(field === 'category' && { storeClass: '', itemNumber: '' }),
      ...(field === 'storeClass' && { itemNumber: '' })
    }));
  };

  const handleAddItemToList = () => {
    if (!addItemForm.chain || !addItemForm.category || !addItemForm.storeClass || !addItemForm.itemNumber) {
      alert('Please fill all fields');
      return;
    }

    // Look for the item in the filtered available items first, then fall back to all available items
    const selectedItem = filteredAvailableItems.find(item => item.itemCode === addItemForm.itemNumber) || 
                         availableItems.find(item => item.itemCode === addItemForm.itemNumber);
    
    if (!selectedItem) {
      alert('Selected item not found');
      return;
    }

    // Check if item already added (this should not happen due to filtering, but kept as safety check)
    const isDuplicate = addedItems.some(
      item => item.chain === addItemForm.chain && 
              item.category === addItemForm.category && 
              item.storeClass === addItemForm.storeClass && 
              item.itemCode === addItemForm.itemNumber
    );

    if (isDuplicate) {
      alert('This item has already been added to the list');
      return;
    }

    // Find the descriptions for display
    const chainObj = chains.find(c => c.chainCode === addItemForm.chain);
    const categoryObj = categories.find(c => c.category.toLowerCase() === addItemForm.category);
    const storeClassObj = storeClasses.find(sc => sc.storeClassCode === addItemForm.storeClass);

    const newItem = {
      chain: addItemForm.chain, // Code for backend
      chainName: chainObj?.chainName || addItemForm.chain, // Name for display
      category: addItemForm.category, // Code for backend
      categoryName: categoryObj?.category || addItemForm.category, // Name for display
      storeClass: addItemForm.storeClass, // Code for backend
      storeClassName: storeClassObj?.storeClassification || addItemForm.storeClass, // Name for display
      itemCode: selectedItem.itemCode,
      itemName: selectedItem.itemDescription,
      id: Date.now() // Temporary ID for tracking
    };

    setAddedItems(prev => [...prev, newItem]);
  };

  const handleClearAddForm = () => {
    setAddItemForm({
      chain: '',
      category: '',
      storeClass: '',
      itemNumber: ''
    });
  };

  const handleDeleteAddedItem = async (itemId) => {
    const itemToDelete = addedItems.find(item => item.id === itemId);
    if (!itemToDelete) return;

    try {
      setLoading(true);
      
      // Build column name from selected filters
      const columnName = `${filterValues.chain}${filterValues.storeClass}`;
      
      console.log('🗑️ Deleting item:', itemToDelete.itemCode, 'Column:', columnName);

      // Call backend to set the column to NULL instead of deleting
      const response = await axios.post(`${API_BASE_URL}/inventory/remove-exclusivity-item`, {
        itemCode: itemToDelete.itemCode,
        column: columnName
      });

      if (response.data.success) {
        // Remove from local state only after successful backend update
        setAddedItems(prev => prev.filter(item => item.id !== itemId));
        
        setSnackbar({
          open: true,
          message: 'Item removed successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error removing item:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to remove item',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllItems = async () => {
    if (addedItems.length === 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Transform added items to the format expected by the backend
      const itemsToSave = addedItems.map(item => ({
        chain: item.chain,
        category: item.category,
        storeClass: item.storeClass,
        itemCode: item.itemCode
      }));

      const response = await axios.post(`${API_BASE_URL}/inventory/add-exclusivity-items`, {
        items: itemsToSave
      });

      // Check response status
      if (response.status === 200 || response.status === 207) {
        const { summary, results } = response.data;
        
        // Show notification using Snackbar (consistent with ExclusivityForm)
        if (summary.success > 0) {
          const successMsg = `Successfully saved ${summary.success} item(s) to the database!${summary.failed > 0 ? ` ${summary.failed} item(s) failed.` : ''}`;
          setSnackbar({
            open: true,
            message: successMsg,
            severity: summary.failed > 0 ? 'warning' : 'success'
          });
        }

        // Log any failures for debugging
        if (results.failed && results.failed.length > 0) {
          console.error('Failed items:', results.failed);
        }

        // Clear added items and close modal
        setAddedItems([]);
        setOpenAddModal(false);

        // Refresh the items list to show newly added items
        await fetchItems();
      }
    } catch (err) {
      console.error('Error saving items:', err);
      // Show error notification
      setSnackbar({
        open: true,
        message: err.response?.data?.error || err.message || 'Failed to save items',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleOpenDialog = (row) => {
    blurActiveElement();
    setDialogMode('single');
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleOpenBulkDialog = () => {
    if (selectedRows.size === 0) return;
    blurActiveElement();
    setDialogMode('multiple');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedRow(null);
    setOpenDialog(false);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      
      if (dialogMode === 'single' && selectedRow) {
        // Delete single row via backend
        const key = rowKey(selectedRow);
        const itemToDelete = rowsState.find(r => rowKey(r) === key);
        
        if (itemToDelete) {
          // Build column name from selected filters
          const columnName = `${filterValues.chain}${filterValues.storeClass}`;
          
          console.log('🗑️ Deleting single item:', itemToDelete.itemCode, 'Column:', columnName);

          const response = await axios.post(`${API_BASE_URL}/inventory/remove-exclusivity-item`, {
            itemCode: itemToDelete.itemCode,
            column: columnName
          });

          if (response.data.success) {
            setRowsState((prev) => prev.filter((r) => rowKey(r) !== key));
            setSelectedRows((prev) => {
              const newSet = new Set(prev);
              newSet.delete(key);
              return newSet;
            });
            
            setSnackbar({
              open: true,
              message: 'Item removed successfully',
              severity: 'success'
            });
          }
        }
      } else if (dialogMode === 'multiple') {
        // Delete multiple rows via backend
        const itemsToDelete = rowsState.filter((r) => selectedRows.has(rowKey(r)));
        
        // Build column name from selected filters
        const columnName = `${filterValues.chain}${filterValues.storeClass}`;
        
        console.log('🗑️ Deleting', itemsToDelete.length, 'items, Column:', columnName);
        
        let successCount = 0;
        let failCount = 0;

        for (const item of itemsToDelete) {
          try {
            const response = await axios.post(`${API_BASE_URL}/inventory/remove-exclusivity-item`, {
              itemCode: item.itemCode,
              column: columnName
            });

            if (response.data.success) {
              successCount++;
            }
          } catch (error) {
            console.error('Error deleting item:', item.itemCode, error);
            failCount++;
          }
        }

        // Update UI after all deletions
        if (successCount > 0) {
          setRowsState((prev) => prev.filter((r) => !selectedRows.has(rowKey(r))));
          setSelectedRows(new Set());
          
          setSnackbar({
            open: true,
            message: `Successfully removed ${successCount} item(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
            severity: failCount > 0 ? 'warning' : 'success'
          });
        } else if (failCount > 0) {
          setSnackbar({
            open: true,
            message: `Failed to remove ${failCount} item(s)`,
            severity: 'error'
          });
        }
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error in handleConfirmDelete:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to remove item(s)',
        severity: 'error'
      });
      handleCloseDialog();
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (key) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) newSet.delete(key);
      else newSet.add(key);
      return newSet;
    });
  };

  const handleSelectAll = (checked, visibleRows) => {
    if (checked) {
      const newSet = new Set([
        ...selectedRows,
        ...visibleRows.map((r) => rowKey(r)),
      ]);
      setSelectedRows(newSet);
    } else {
      const newSet = new Set(selectedRows);
      visibleRows.forEach((r) => newSet.delete(rowKey(r)));
      setSelectedRows(newSet);
    }
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const handleQtyChange = (key) => (e) => {
    const val = e.target.value;
    setQuantities((prev) => ({ ...prev, [key]: val === '' ? '' : Number(val) }));
  };

  const handleQtyBlur = (key) => () => {
    setQuantities((prev) => {
      let v = prev[key];
      if (v === '' || isNaN(v)) v = 0;
      v = Math.max(0, Math.trunc(Number(v)));
      return { ...prev, [key]: v };
    });
  };

  const preventWheelChange = (e) => {
    e.target.blur();
    setTimeout(() => e.target.focus(), 0);
  };

  // --- Filtering ---
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rowsState;
    return rowsState.filter(
      (r) =>
        r.itemCode.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [search, rowsState]);

  const pagedRows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  useEffect(() => setPage(0), [search]);

  // --- UI ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filter Section */}
      <Box component="form" noValidate autoComplete="off">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TuneOutlined />
          <strong>Parameter</strong>
        </Box>
        <Filter onChange={handleFilterChange} hideTransaction={true} />
      </Box>

      {/* Error Alert - Keep for fetch/display errors */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {/* Search + Bulk Delete Bar */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Search items (code or description)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearch('')} edge="end">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              sx={{ flex: 1, mr: 2 }}
              disabled={!filterValues.chain || !filterValues.category || !filterValues.storeClass}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{ mr: 2 }}
            >
              Add Item
            </Button>

            <Button
              variant="contained"
              color="secondary"
              startIcon={<CloudUploadIcon />}
              onClick={handleOpenMassUploadModal}
              sx={{ mr: 2 }}
            >
              Mass Upload
            </Button>

            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteForeverIcon />}
              onClick={handleOpenBulkDialog}
              disabled={selectedRows.size === 0}
            >
              Delete Selected ({selectedRows.size})
            </Button>
          </Stack>

        {/* Table */}
        <TableContainer sx={{ maxHeight: 560 }}>
          <Table stickyHeader aria-label="items table">
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    sx={{ fontWeight: 'bold' }}
                    style={{ minWidth: col.width }}
                  >
                    {col.id === 'select' ? (
                      <Checkbox
                        color="primary"
                        checked={
                          pagedRows.length > 0 &&
                          pagedRows.every((r) => selectedRows.has(rowKey(r)))
                        }
                        indeterminate={
                          pagedRows.some((r) => selectedRows.has(rowKey(r))) &&
                          !pagedRows.every((r) => selectedRows.has(rowKey(r)))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked, pagedRows)}
                      />
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {pagedRows.map((row, idx) => {
                const key = rowKey(row);
                return (
                  <TableRow hover key={`${key}-${page}-${idx}`}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(key)}
                        onChange={() => handleCheckboxChange(key)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{row.itemCode}</TableCell>
                    <TableCell>{row.description}</TableCell>
                    {/* <TableCell>
                      <TextField
                        value={quantities[key] ?? 0}
                        onChange={handleQtyChange(key)}
                        onBlur={handleQtyBlur(key)}
                        onWheel={preventWheelChange}
                        size="small"
                        type="number"
                        inputProps={{ min: 0, step: 1 }}
                        fullWidth
                      />
                    </TableCell> */}
                    <TableCell>
                      <Tooltip title="Delete item">
                        <IconButton color="error" onClick={() => handleOpenDialog(row)}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

              {pagedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    {!filterValues.chain || !filterValues.category || !filterValues.storeClass
                      ? 'Please select Chain, Category, and Store Classification to view items.'
                      : `No results found${search ? ` for "${search}"` : ''}.`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        </Paper>
      )}

      {/* Add Item Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => {}} 
        disableEscapeKeyDown
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Chain</InputLabel>
                  <Select
                    value={addItemForm.chain}
                    label="Chain"
                    onChange={handleAddItemFormChange('chain')}
                  >
                    <MenuItem value="">
                      <em>Select Chain</em>
                    </MenuItem>
                    {chains.map((chain) => (
                      <MenuItem key={chain.chainCode} value={chain.chainCode}>
                        {chain.chainName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={addItemForm.category}
                    label="Category"
                    onChange={handleAddItemFormChange('category')}
                    disabled={!addItemForm.chain}
                  >
                    <MenuItem value="">
                      <em>Select Category</em>
                    </MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.catCode} value={cat.category.toLowerCase()}>
                        {cat.category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Store Classification</InputLabel>
                  <Select
                    value={addItemForm.storeClass}
                    label="Store Classification"
                    onChange={handleAddItemFormChange('storeClass')}
                    disabled={!addItemForm.category}
                  >
                    <MenuItem value="">
                      <em>Select Store Classification</em>
                    </MenuItem>
                    {storeClasses.map((sc) => (
                      <MenuItem key={sc.storeClassCode} value={sc.storeClassCode}>
                        {sc.storeClassification}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Autocomplete
                  fullWidth
                  size="small"
                  options={filteredAvailableItems}
                  getOptionLabel={(option) => `${option.itemCode} - ${option.itemDescription}`}
                  value={filteredAvailableItems.find(item => item.itemCode === addItemForm.itemNumber) || null}
                  onChange={(event, newValue) => {
                    setAddItemForm(prev => ({
                      ...prev,
                      itemNumber: newValue ? newValue.itemCode : ''
                    }));
                  }}
                  disabled={!addItemForm.storeClass || loadingItems}
                  loading={loadingItems}
                  noOptionsText={loadingItems ? "Loading items..." : filteredAvailableItems.length === 0 ? "No available items" : "No items found"}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Item Number"
                      placeholder="Search by code or description..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingItems ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter(option =>
                      option.itemCode.toLowerCase().includes(searchTerm) ||
                      option.itemDescription.toLowerCase().includes(searchTerm)
                    );
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleAddItemToList}
                    disabled={!addItemForm.chain || !addItemForm.category || !addItemForm.storeClass || !addItemForm.itemNumber}
                  >
                    Add to List
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClearAddForm}
                    sx={{ minWidth: '120px' }}
                  >
                    Clear
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Added Items Table */}
            {addedItems.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Added Items</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Chain</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Store Classification</strong></TableCell>
                        <TableCell><strong>Item Code</strong></TableCell>
                        <TableCell><strong>Item Name</strong></TableCell>
                        <TableCell align="center"><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {addedItems
                        .slice(addedItemsPage * addedItemsRowsPerPage, addedItemsPage * addedItemsRowsPerPage + addedItemsRowsPerPage)
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.chainName}</TableCell>
                            <TableCell>{item.categoryName}</TableCell>
                            <TableCell>{item.storeClassName}</TableCell>
                            <TableCell>{item.itemCode}</TableCell>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleDeleteAddedItem(item.id)}
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={addedItems.length}
                    rowsPerPage={addedItemsRowsPerPage}
                    page={addedItemsPage}
                    onPageChange={(e, newPage) => setAddedItemsPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setAddedItemsRowsPerPage(+e.target.value);
                      setAddedItemsPage(0);
                    }}
                  />
                </TableContainer>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} color="inherit">
            Close
          </Button>
          <Button 
            onClick={handleSaveAllItems} 
            variant="contained" 
            color="success"
            disabled={addedItems.length === 0 || loading}
          >
            {loading ? 'Saving...' : `Save All (${addedItems.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogMode === 'single' ? (
              <>
                Are you sure you want to delete{' '}
                <strong>{selectedRow?.description}</strong> (
                {selectedRow?.itemCode})? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete{' '}
                <strong>{selectedRows.size}</strong> selected item
                {selectedRows.size > 1 ? 's' : ''}? This action cannot be undone.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Add Modal Confirmation Dialog */}
      <Dialog open={openCloseConfirmDialog} onClose={handleCancelCloseAddModal}>
        <DialogTitle>Confirm Close</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved data. All inputs and added items will be cleared. Do you want to continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCloseAddModal} color="inherit">
            No
          </Button>
          <Button onClick={handleConfirmCloseAddModal} color="primary" variant="contained">
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mass Upload Modal */}
      <Dialog 
        open={openMassUploadModal} 
        onClose={() => {}}
        disableEscapeKeyDown
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>Mass Upload Items</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Upload an Excel or CSV file.
                <br />
                <strong>Required columns:</strong> Chain, Category, StoreClass, and ItemCode.
                <br />
                <strong>Note:</strong> Use the full names (not codes) for Chain, Category, and StoreClass.
              </Typography>
            </Alert>

            {/* Code Reference Legend */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                Valid Values Reference (Use Names in Excel)
              </Typography>
              <Grid container spacing={2}>
                {/* Chain Names */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#2e7d32' }}>
                      Chain Names
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                      {chains.map((chain) => (
                        <Typography key={chain.chainCode} variant="body2" sx={{ py: 0.5 }}>
                          • <strong>{chain.chainName}</strong>
                        </Typography>
                      ))}
                      {chains.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Loading...
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Category Names */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%', overflow: 'hidden' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#ed6c02' }}>
                      Category Names
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                      {categories.map((cat) => (
                        <Typography key={cat.catCode} variant="body2" sx={{ py: 0.5 }}>
                          • <strong>{cat.category}</strong>
                        </Typography>
                      ))}
                      {categories.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Loading...
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Store Classification Names */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#9c27b0' }}>
                      Store Classifications
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                      {storeClasses.map((sc) => (
                        <Typography key={sc.storeClassCode} variant="body2" sx={{ py: 0.5 }}>
                          • <strong>{sc.storeClassification}</strong>
                        </Typography>
                      ))}
                      {storeClasses.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Loading...
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Important:</strong> Use the full names (not codes) in your Excel file.
                  <br />
                  <strong>Example:</strong> Chain: <code>{chains[0]?.chainName || 'Chain Name'}</code>, 
                  Category: <code>{categories[0]?.category || 'Category'}</code>, 
                  StoreClass: <code>{storeClasses[0]?.storeClassification || 'Store Classification'}</code>
                </Typography>
              </Alert>
            </Box>

            <Stack spacing={2}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleDownloadTemplate}
                sx={{ alignSelf: 'flex-start' }}
              >
                Download Template
              </Button>

              <Box 
                sx={{ 
                  border: isDragging ? '2px solid #1976d2' : '2px dashed #ccc', 
                  borderRadius: 2, 
                  p: 3, 
                  textAlign: 'center', 
                  backgroundColor: isDragging ? '#e3f2fd' : '#f9f9f9',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  accept=".xlsx,.xls,.csv"
                  style={{ display: 'none' }}
                  id="mass-upload-file"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="mass-upload-file" style={{ cursor: 'pointer', display: 'block' }}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: isDragging ? '#1976d2' : '#9e9e9e', mb: 2 }} />
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold', color: isDragging ? '#1976d2' : 'inherit' }}>
                    {isDragging ? 'Drop file here' : 'Drag & drop file here'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    or
                  </Typography>
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                  >
                    Choose File
                  </Button>
                  <Typography variant="caption" display="block" sx={{ mt: 2 }} color="text.secondary">
                    Supported formats: Excel (.xlsx, .xls) or CSV (.csv) • Max size: 10MB
                  </Typography>
                </label>
                {uploadFile && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: '#e8f5e9', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                      ✓ Selected: <strong>{uploadFile.name}</strong>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(uploadFile.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                )}
              </Box>

              {uploadResults && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity={uploadResults.summary.failed > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Upload Results:</strong>
                    </Typography>
                    <Typography variant="body2">
                      Total: {uploadResults.summary.total} | 
                      Success: {uploadResults.summary.success} | 
                      Failed: {uploadResults.summary.failed}
                    </Typography>
                  </Alert>

                  {uploadResults.results.failed && uploadResults.results.failed.length > 0 && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" color="error">
                          Failed Items:
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          onClick={handleExportFailedItems}
                        >
                          Export Failed Items
                        </Button>
                      </Box>
                      <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 2, backgroundColor: '#fff' }}>
                        {uploadResults.results.failed.map((item, index) => (
                          <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            • <strong>Row {item.row}:</strong> {item.itemCode}
                            <br />
                            <span style={{ marginLeft: '12px', color: '#d32f2f' }}>
                              {item.reason || 'Unknown error'}
                            </span>
                          </Typography>
                        ))}
                      </Box>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Tip:</strong> Click "Export Failed Items" to download an Excel file with the errors. 
                          Fix the data in Excel and upload it again.
                        </Typography>
                      </Alert>
                    </>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMassUploadModal} color="inherit">
            Close
          </Button>
          <Button 
            onClick={handleMassUpload} 
            variant="contained" 
            color="primary"
            disabled={!uploadFile || uploadLoading}
            startIcon={uploadLoading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          >
            {uploadLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback (consistent with ExclusivityForm) */}
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
    </Box>
  );
}
