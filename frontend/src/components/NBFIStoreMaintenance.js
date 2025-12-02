
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Paper, TextField, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, TablePagination, IconButton, InputAdornment, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Checkbox, Stack, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Typography, Autocomplete, Snackbar, Tooltip, Grid } from '@mui/material';
import { TuneOutlined, Search as SearchIcon, Clear as ClearIcon, DeleteForever as DeleteForeverIcon, Add as AddIcon, CloudUpload as CloudUploadIcon, FileDownload as FileDownloadIcon } from '@mui/icons-material';
import Filter from './Filter';
import axios from 'axios';
import * as XLSX from 'xlsx';

// Fetch stores for Add Store modal (by chain only, exclusive endpoint)
async function fetchModalStores(chain) {
  if (!chain) return [];
  try {
    const response = await axios.get(`${API_BASE_URL}/filters/nbfi/modal-stores`, {
      params: { chain }
    });
    return response.data.items || [];
  } catch (err) {
    console.error('Error fetching modal stores:', err);
    return [];
  }
}

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function NBFIStoreMaintenance() {
  const [rowsState, setRowsState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({
    chain: '',
    brand: '',
    storeClassification: '',
    transaction: ''
  });

  // Normalize incoming filter shape from child Filter component which may still emit `storeClass`
  useEffect(() => {
    if (filterValues.storeClass && !filterValues.storeClassification) {
      setFilterValues(prev => ({ ...prev, storeClassification: prev.storeClass }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.storeClass]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('single');
  const [selectedRow, setSelectedRow] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [addBranchForm, setAddBranchForm] = useState({ chain: '', brand: '', storeClassification: '', branchCode: '' });
  const [availableBranches, setAvailableBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [addedBranches, setAddedBranches] = useState([]);
  const [addedBranchesPage, setAddedBranchesPage] = useState(0);
  const [addedBranchesRowsPerPage, setAddedBranchesRowsPerPage] = useState(5);
  const [chains, setChains] = useState([]);
  const [brands, setBrands] = useState([]);
  const [storeClasses, setStoreClasses] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Mass Upload Modal states
  const [openMassUploadModal, setOpenMassUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fetchBranches = async () => {
    if (!filterValues.chain || !filterValues.brand || !filterValues.storeClassification) {
      setRowsState([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/filters/nbfi/stores`, { 
        params: {
          chain: filterValues.chain,
          brand: filterValues.brand,
          storeClassification: filterValues.storeClassification
        }
      });
      setRowsState((response.data.items || []).map(b => ({ branchCode: b.branchCode, branchName: b.branchName })));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch branches');
      setRowsState([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [c, br, sc] = await Promise.all([
          axios.get(`${API_BASE_URL}/filters/nbfi/chains`),
          axios.get(`${API_BASE_URL}/filters/nbfi/brands`),
          axios.get(`${API_BASE_URL}/filters/nbfi/store-classes`)
        ]);
        setChains(c.data.items || []);
        setBrands(br.data.items || []);
        setStoreClasses(sc.data.items || []);
      } catch (err) { console.error(err); }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => { fetchBranches(); }, [filterValues.chain, filterValues.brand, filterValues.storeClassification]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rowsState;
    const s = search.toLowerCase();
    return rowsState.filter(r => r.branchCode?.toLowerCase().includes(s) || r.branchName?.toLowerCase().includes(s));
  }, [rowsState, search]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredRows, page, rowsPerPage]);

  useEffect(() => setPage(0), [search]);

  // Fetch available stores for Add Store modal using the exclusive endpoint
  const fetchAvailableBranches = async () => {
    const { chain } = addBranchForm;
    if (!chain) {
      setAvailableBranches([]);
      return;
    }
    try {
      setLoadingBranches(true);
      const items = await fetchModalStores(chain);
      console.log('[Add Store Modal] Fetched stores for chain', chain, items);
      setAvailableBranches(items);
    } catch (err) {
      setAvailableBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  useEffect(() => {
    if (addBranchForm.chain && addBranchForm.brand && addBranchForm.storeClassification) {
      fetchAvailableBranches();
    } else if (addBranchForm.chain) {
      fetchAvailableBranches();
    } else {
      setAvailableBranches([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addBranchForm.chain, addBranchForm.brand, addBranchForm.storeClassification]);

  // Filter available stores to exclude already added and match storeClass if selected
  // Filter available stores to exclude already added (no storeClass filtering)
  const filteredAvailableBranches = useMemo(() => {
    // Exclude only if branch is already added for the same chain, brand, and storeClassification
    return availableBranches.filter(b => {
      return !addedBranches.some(added =>
        added.branchCode === b.branchCode &&
        added.chain === addBranchForm.chain &&
        added.brand === addBranchForm.brand &&
        added.storeClassification === addBranchForm.storeClassification
      );
    });
  }, [availableBranches, addedBranches]);

  const paginatedAddedBranches = useMemo(() => {
    const start = addedBranchesPage * addedBranchesRowsPerPage;
    return addedBranches.slice(start, start + addedBranchesRowsPerPage);
  }, [addedBranches, addedBranchesPage, addedBranchesRowsPerPage]);

  // Add Store Modal Handlers
  const handleOpenAddModal = () => {
    setOpenAddModal(true);
    setAddBranchForm({
      chain: '',
      brand: '',
      storeClassification: '',
      branchCode: ''
    });
    setAddedBranches([]);
    setAddedBranchesPage(0);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
    setAddBranchForm({
      chain: '',
      brand: '',
      storeClassification: '',
      branchCode: ''
    });
    setAddedBranches([]);
  };

  const handleAddBranchFormChange = (field, value) => {
    if (field === 'chain') {
      setAddBranchForm(prev => ({
        ...prev,
        chain: value,
        brand: '',
        storeClassification: '',
        branchCode: ''
      }));
    } else if (field === 'brand') {
      setAddBranchForm(prev => ({
        ...prev,
        brand: value,
        storeClassification: '',
        branchCode: ''
      }));
    } else if (field === 'storeClassification') {
      setAddBranchForm(prev => ({
        ...prev,
        storeClassification: value,
        branchCode: ''
      }));
    } else {
      setAddBranchForm(prev => ({ ...prev, [field]: value }));
    }
    // Do NOT clear addedBranches on any field change
  };

  const handleAddBranchToList = () => {
    const { branchCode, chain, brand, storeClassification } = addBranchForm;
    if (!branchCode) return;

    const branch = availableBranches.find(b => b.branchCode === branchCode);
    // Only add if not already added for the same chain, brand, and storeClass
    if (
      branch &&
      !addedBranches.some(b =>
        b.branchCode === branchCode &&
        b.chain === chain &&
        b.brand === brand &&
        b.storeClassification === storeClassification
      )
    ) {
      setAddedBranches(prev => [
        ...prev,
        {
          ...branch,
          chain,
          brand,
          storeClassification
        }
      ]);
      setAddBranchForm(prev => ({ ...prev, branchCode: '' }));
    }
  };

  const handleRemoveFromAddedList = (branchCode) => {
    setAddedBranches(prev => prev.filter(b => b.branchCode !== branchCode));
  };

  const handleSaveAddedBranches = async () => {
    if (addedBranches.length === 0) {
      setSnackbar({
        open: true,
        message: 'No stores to save',
        severity: 'warning'
      });
      return;
    }

    try {
      setLoading(true);
      
      // Format branches array as expected by the backend
      const branchesData = addedBranches.map(b => ({
        chain: addBranchForm.chain,
        brand: addBranchForm.brand,
        storeClassification: addBranchForm.storeClassification,
        branchCode: b.branchCode
      }));

      const response = await axios.post(`${API_BASE_URL}/inventory/nbfi/add-exclusivity-branches`, {
        branches: branchesData,
        brand: addBranchForm.brand
      });

      // Check results - backend returns { summary: { success, failed }, results: { success: [], failed: [] } }
      const summary = response.data.summary || {};
      const successCount = summary.success || 0;
      const failedCount = summary.failed || 0;
      
      if (failedCount > 0) {
        setSnackbar({
          open: true,
          message: `Added ${successCount} store(s). ${failedCount} failed.`,
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Successfully added ${successCount} store(s)`,
          severity: 'success'
        });
      }

      handleCloseAddModal();
      await fetchBranches();
      
    } catch (err) {
      console.error('Error saving branches:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to save branches',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete Handlers
  const handleOpenDialog = (row) => {
    if (!filterValues.chain || !filterValues.brand || !filterValues.storeClassification) {
      setSnackbar({
        open: true,
        message: 'Please select Chain, Brand, and Store Classification before deleting.',
        severity: 'error'
      });
      return;
    }
    setDialogMode('single');
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleOpenBulkDialog = () => {
    if (selectedRows.size === 0) return;
    if (!filterValues.chain || !filterValues.brand || !filterValues.storeClassification) {
      setSnackbar({
        open: true,
        message: 'Please select Chain, Brand, and Store Classification before deleting.',
        severity: 'error'
      });
      return;
    }
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
      
      const branchesToDelete = dialogMode === 'single'
        ? [selectedRow.branchCode]
        : Array.from(selectedRows);

      // Guard: ensure all required params are present
      if (!filterValues.chain || !filterValues.brand || !filterValues.storeClassification || !branchesToDelete.length) {
        setSnackbar({
          open: true,
          message: 'Missing required parameters for delete operation.',
          severity: 'error'
        });
        setLoading(false);
        handleCloseDialog();
        return;
      }
      const payload = {
        branchCodes: branchesToDelete,
        chain: filterValues.chain,
        brand: filterValues.brand,
        storeClassification: filterValues.storeClassification
      };
      console.log('Delete payload:', payload);
      const response = await axios.post(`${API_BASE_URL}/inventory/nbfi/remove-exclusivity-branches`, payload);

      const summary = response.data.summary || {};
      const successCount = summary.success || 0;
      const failedCount = summary.failed || 0;

      if (failedCount > 0) {
        setSnackbar({
          open: true,
          message: `Deleted ${successCount} store(s). ${failedCount} failed.`,
          severity: 'warning'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Successfully deleted ${successCount} store(s)`,
          severity: 'success'
        });
      }

      setSelectedRows(new Set());
      await fetchBranches();

    } catch (error) {
      console.error('Error deleting branches:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to Delete storees',
        severity: 'error'
      });
    } finally {
      handleCloseDialog();
    }
  };

  // Checkbox Logic
  const handleCheckboxChange = (branchCode) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(branchCode)) {
        newSet.delete(branchCode);
      } else {
        newSet.add(branchCode);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked, visibleRows) => {
    if (checked) {
      const newSet = new Set([
        ...selectedRows,
        ...visibleRows.map((r) => r.branchCode),
      ]);
      setSelectedRows(newSet);
    } else {
      const newSet = new Set(selectedRows);
      visibleRows.forEach((r) => newSet.delete(r.branchCode));
      setSelectedRows(newSet);
    }
  };

  // Mass Upload Handlers
  const handleOpenMassUploadModal = () => {
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
      event.target.value = null;
    }
  };

  const validateAndSetFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setSnackbar({
        open: true,
        message: 'File size exceeds 10MB limit. Please upload a smaller file.',
        severity: 'error'
      });
      return;
    }

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
    // Validate headers (require Store Code, Brand, Store Classification)
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = (rows[0] || []).map(h => ('' + (h || '')).trim().toLowerCase());

        const hasStoreCode = headers.some(h => h === 'store code' || h === 'storecode' || h === 'store_code');
        const hasBrand = headers.some(h => h === 'brand');
        const hasStoreClass = headers.some(h => h === 'store classification' || h === 'storeclassification' || h === 'storeclass');

        if (!hasStoreCode || !hasBrand || !hasStoreClass) {
          const missing = [];
          if (!hasStoreCode) missing.push('Store Code');
          if (!hasBrand) missing.push('Brand');
          if (!hasStoreClass) missing.push('Store Classification');
          setSnackbar({
            open: true,
            message: `Missing required column(s): ${missing.join(', ')}. Please include them in the file.`,
            severity: 'error'
          });
          return;
        }

        setUploadFile(file);
        setUploadResults(null);
      } catch (err) {
        console.error('Error validating file headers:', err);
        setSnackbar({ open: true, message: 'Failed to parse file for header validation', severity: 'error' });
      }
    };
    reader.onerror = () => {
      setSnackbar({ open: true, message: 'Failed to read file for validation', severity: 'error' });
    };
    reader.readAsArrayBuffer(file);
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      validateAndSetFile(file);
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

      const response = await axios.post(`${API_BASE_URL}/inventory/nbfi/mass-upload-exclusivity-branches`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadResults(response.data);
      
      if (response.data.summary.success > 0) {
        const { created = 0, updated = 0, failed = 0 } = response.data.summary;
        let message = `Successfully processed ${response.data.summary.success} store(s)`;
        
        const breakdown = [];
        if (created > 0) breakdown.push(`${created} created`);
        if (updated > 0) breakdown.push(`${updated} updated`);
        if (breakdown.length > 0) {
          message += ` (${breakdown.join(', ')})`;
        }
        
        if (failed > 0) {
          message += `. ${failed} failed.`;
        }
        
        setSnackbar({
          open: true,
          message: message,
          severity: failed > 0 ? 'warning' : 'success'
        });
        
        await fetchBranches();
      } else {
        setSnackbar({
          open: true,
          message: 'Upload completed but No stores were processed',
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
    const sampleData = [
      {
        'Store Code': 'NB1A',
        'Store Description': 'NBFI SAMPLE STORE ALABANG',
        'Chain': chains[0]?.chainName || 'VARIOUS CHAIN',
        'Brand': brands[0]?.brand || 'BRAND_A',
        'Store Classification': storeClasses[0]?.storeClassification || 'A Stores - Extra High'
      },
      {
        'Store Code': 'NB2B',
        'Store Description': 'NBFI SAMPLE STORE MAKATI',
        'Chain': chains[1]?.chainName || 'SM HOMEWORLD',
        'Brand': brands[1]?.brand || 'BRAND_B',
        'Store Classification': storeClasses[2]?.storeClassification || 'C Stores - Medium'
      }
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    ws['!cols'] = [
      { wch: 15 }, { wch: 50 }, { wch: 25 }, { wch: 25 }, { wch: 20 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'mass_upload_branches_template.xlsx');
  };

  const handleExportFailedBranches = () => {
    if (!uploadResults || !uploadResults.results.failed || uploadResults.results.failed.length === 0) {
      setSnackbar({
        open: true,
        message: 'No failed branches to export',
        severity: 'info'
      });
      return;
    }

    try {
      const failedData = uploadResults.results.failed.map(item => ({
        'Row': item.row || 'N/A',
        'Store Code': item.data?.['Store Code'] || item.branchCode || '',
        'Store Description': item.data?.['Store Description'] || '',
        'Chain': item.data?.Chain || '',
        'Brand': item.data?.Brand || '',
        'Store Classification': item.data?.['Store Classification'] || item.data?.StoreClass || '',
        'Error Reason': item.reason || (item.errors && item.errors.join('; ')) || 'Unknown error'
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(failedData);

      ws['!cols'] = [
        { wch: 8 }, { wch: 15 }, { wch: 50 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 60 }
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Failed Branches');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `failed_branches_${timestamp}.xlsx`;
      XLSX.writeFile(wb, filename);

      setSnackbar({
        open: true,
        message: `Exported ${failedData.length} failed store(s)`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error exporting failed branches:', error);
      setSnackbar({
        open: true,
        message: 'Failed to export file',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filter Section */}
      <Box component="form" noValidate autoComplete="off">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TuneOutlined />
          <strong>Parameter</strong>
        </Box>
        <Filter onChange={setFilterValues} hideTransaction={true} categoryLabel="Brand" isNBFI={true} />
      </Box>

      {/* Error Alert */}
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
          {/* Search + Action Buttons Bar */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Search stores (code or name)"
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
              disabled={!filterValues.chain || !filterValues.brand || !filterValues.storeClassification}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddModal}
              sx={{ mr: 2 }}
            >
              Add Store
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
          <Table stickyHeader aria-label="branches table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }} style={{ minWidth: 50 }}>
                  <Checkbox
                    color="primary"
                    checked={
                      paginatedRows.length > 0 &&
                      paginatedRows.every((r) => selectedRows.has(r.branchCode))
                    }
                    indeterminate={
                      paginatedRows.some((r) => selectedRows.has(r.branchCode)) &&
                      !paginatedRows.every((r) => selectedRows.has(r.branchCode))
                    }
                    onChange={(e) =>
                      handleSelectAll(e.target.checked, paginatedRows)
                    }
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} style={{ minWidth: 200 }}>
                  Store Code
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} style={{ minWidth: 600 }}>
                  Store Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} style={{ minWidth: 120 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {!filterValues.chain || !filterValues.brand || !filterValues.storeClassification
                      ? 'Please select Chain, Brand, and Store Classification to view branches.'
                      : `No results found${search ? ` for "${search}"` : ''}.`}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => (
                  <TableRow hover key={row.branchCode}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(row.branchCode)}
                        onChange={() => handleCheckboxChange(row.branchCode)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>{row.branchCode}</TableCell>
                    <TableCell>{row.branchName}</TableCell>
                    <TableCell>
                      <Tooltip title="Delete store">
                        <IconButton color="error" onClick={() => handleOpenDialog(row)}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogMode === 'single' ? (
              <>
                Are you sure you want to delete{' '}
                <strong>{selectedRow?.branchName}</strong> (
                {selectedRow?.branchCode})? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete{' '}
                <strong>{selectedRows.size}</strong> selected branch
                {selectedRows.size > 1 ? 'es' : ''}? This action cannot be undone.
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

      {/* Add Store Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => {}} 
        disableEscapeKeyDown
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Add Store</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Chain</InputLabel>
                  <Select
                    value={addBranchForm.chain}
                    label="Chain"
                    onChange={(e) => handleAddBranchFormChange('chain', e.target.value)}
                  >
                    <MenuItem value="">
                      <em>Select Chain</em>
                    </MenuItem>
                    {chains.map((chain, index) => (
                      <MenuItem key={chain.id || chain.chainCode || `chain-${index}`} value={chain.chainCode}>
                        {chain.chainName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Brand</InputLabel>
                  <Select
                    value={addBranchForm.brand || ''}
                    label="Brand"
                    onChange={(e) => handleAddBranchFormChange('brand', e.target.value)}
                    disabled={!addBranchForm.chain}
                  >
                    <MenuItem value="">
                      <em>Select Brand</em>
                    </MenuItem>
                    {brands.map((b, index) => (
                      <MenuItem key={b.brandCode || `brand-${index}`} value={b.brandCode}>
                        {b.brand}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Store Classification</InputLabel>
                  <Select
                    value={addBranchForm.storeClassification || ''}
                    label="Store Classification"
                    onChange={(e) => handleAddBranchFormChange('storeClassification', e.target.value)}
                    disabled={!addBranchForm.brand}
                  >
                    <MenuItem value="">
                      <em>Select Store Classification</em>
                    </MenuItem>
                    {storeClasses.map((sc, index) => (
                      <MenuItem key={sc.id || sc.storeClassCode || `sc-${index}`} value={sc.storeClassCode}>
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
                  options={filteredAvailableBranches}
                  getOptionLabel={(option) => `${option.branchCode} - ${option.branchName}`}
                  value={filteredAvailableBranches.find(b => b.branchCode === addBranchForm.branchCode) || null}
                  onChange={(e, newValue) => handleAddBranchFormChange('branchCode', newValue?.branchCode || '')}
                  disabled={!addBranchForm.chain || loadingBranches}
                  loading={loadingBranches}
                  noOptionsText={loadingBranches ? "Loading branches..." : filteredAvailableBranches.length === 0 ? "No available stores" : "No stores found"}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Store"
                      placeholder="Search by code or name..."
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingBranches ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  filterOptions={(options, { inputValue }) => {
                    const searchTerm = inputValue.toLowerCase();
                    return options.filter(option =>
                      option.branchCode.toLowerCase().includes(searchTerm) ||
                      option.branchName.toLowerCase().includes(searchTerm)
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
                    onClick={handleAddBranchToList}
                    disabled={!addBranchForm.chain || !addBranchForm.branchCode}
                  >
                    Add to List
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      // Clear all select fields in the Add Store modal: chain, brand, storeClassification, and store
                      setAddBranchForm({ chain: '', brand: '', storeClassification: '', branchCode: '' });
                      setAvailableBranches([]);
                    }}
                    sx={{ minWidth: '120px' }}
                  >
                    Clear
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Added Stores Table */}
            {addedBranches.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Added Stores</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Store Code</strong></TableCell>
                        <TableCell><strong>Store Name</strong></TableCell>
                        <TableCell><strong>Brand</strong></TableCell>
                        <TableCell><strong>Store Classification</strong></TableCell>
                        <TableCell align="center"><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedAddedBranches.map((branch) => {
                        // Find brand and storeClass descriptions
                        const brandObj = brands.find(b => b.brandCode === branch.brand || b.brandCode === branch.brandCode);
                        const brandLabel = brandObj ? brandObj.brand : branch.brand || branch.brandCode;
                        const storeClassObj = storeClasses.find(sc => sc.storeClassCode === branch.storeClass || sc.storeClassCode === branch.storeClassCode);
                        const storeClassLabel = storeClassObj ? storeClassObj.storeClassification : branch.storeClass || branch.storeClassCode;
                        return (
                          <TableRow key={branch.branchCode + '-' + (branch.brand || '') + '-' + (branch.storeClass || '')}>
                            <TableCell>{branch.branchCode}</TableCell>
                            <TableCell>{branch.branchName}</TableCell>
                            <TableCell>{brandLabel}</TableCell>
                            <TableCell>{storeClassLabel}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleRemoveFromAddedList(branch.branchCode)}
                              >
                                <DeleteForeverIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={addedBranches.length}
                    rowsPerPage={addedBranchesRowsPerPage}
                    page={addedBranchesPage}
                    onPageChange={(e, newPage) => setAddedBranchesPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setAddedBranchesRowsPerPage(+e.target.value);
                      setAddedBranchesPage(0);
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
            onClick={handleSaveAddedBranches} 
            variant="contained" 
            color="success"
            disabled={addedBranches.length === 0 || loading}
          >
            {loading ? 'Saving...' : `Save All (${addedBranches.length})`}
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
        <DialogTitle>Mass Upload Stores</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Upload an Excel or CSV file.
                <br />
                <strong>Required columns:</strong> Store Code, Brand, Store Classification
                <br />
                <strong>Optional columns:</strong> Store Description, Chain
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
                      {chains.map((chain, index) => (
                        <Typography key={chain.chainCode || index} variant="body2" sx={{ py: 0.5 }}>
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
                {/* Brands */}
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#6a1b9a' }}>
                      Brands
                    </Typography>
                    <Box sx={{ maxHeight: 150, overflow: 'auto' }}>
                      {brands.map((b, index) => (
                        <Typography key={b.brandCode || index} variant="body2" sx={{ py: 0.5 }}>
                          • <strong>{b.brand}</strong>
                        </Typography>
                      ))}
                      {brands.length === 0 && (
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
                      {storeClasses.map((sc, index) => (
                        <Typography key={sc.storeClassCode || index} variant="body2" sx={{ py: 0.5 }}>
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
                  <strong>Important:</strong> Use the full chain names in your Excel file.
                  <br />
                  <strong>Example:</strong> Chain: <code>{chains[0]?.chainName || 'Chain Name'}</code>, 
                  Store Classification: <code>{storeClasses[0]?.storeClassification || 'Store Classification'}</code>
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
                          Failed Stores:
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<FileDownloadIcon />}
                          onClick={handleExportFailedBranches}
                        >
                          Export Failed Stores
                        </Button>
                      </Box>
                      <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #ddd', borderRadius: 1, p: 2, backgroundColor: '#fff' }}>
                        {uploadResults.results.failed.map((item, index) => (
                          <Typography key={index} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            • <strong>Row {item.row}:</strong> {item.data?.['Store Code'] || item.branchCode || 'Unknown'}
                            <br />
                            <span style={{ marginLeft: '12px', color: '#d32f2f' }}>
                              {item.reason || (item.errors && item.errors.join('; ')) || 'Unknown error'}
                            </span>
                          </Typography>
                        ))}
                      </Box>
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Tip:</strong> Click "Export Failed Stores" to download an Excel file with the errors. 
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

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(p => ({ ...p, open: false }))} 
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


