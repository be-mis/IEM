import * as React from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box, Paper, TextField, Grid, IconButton, Table, TableBody, TableContainer,
  TableHead, TableRow, TableCell, TablePagination, Tooltip, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Checkbox, Stack, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Typography, Autocomplete, Snackbar
} from '@mui/material';
import {
  TuneOutlined, Search as SearchIcon, Clear as ClearIcon,
  DeleteForever as DeleteForeverIcon, Add as AddIcon
} from '@mui/icons-material';
import Filter from '../components/Filter';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const columns = [
  { id: 'select', label: '', minWidth: 50 },
  { id: 'branchCode', label: 'Branch Code', minWidth: 200 },
  { id: 'branchName', label: 'Branch Name', minWidth: 600 },
  { id: 'action', label: 'Action', minWidth: 120 },
];

const rowKey = (r) => r.branchCode;

export default function StoreMaintenance() {
  const [rowsState, setRowsState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'info' | 'warning'
  });
  const [filterValues, setFilterValues] = useState({
    chain: '',
    category: '',
    storeClass: '',
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Pagination for added branches table in modal
  const [addedBranchesPage, setAddedBranchesPage] = useState(0);
  const [addedBranchesRowsPerPage, setAddedBranchesRowsPerPage] = useState(5);

  const [selectedRows, setSelectedRows] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('single'); // 'single' or 'multiple'
  const [selectedRow, setSelectedRow] = useState(null);

  // Add Branch Modal states
  const [openAddModal, setOpenAddModal] = useState(false);
  const [addBranchForm, setAddBranchForm] = useState({
    chain: '',
    category: '',
    storeClass: '',
    branchCode: ''
  });
  const [availableBranches, setAvailableBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [addedBranches, setAddedBranches] = useState([]);
  const [openCloseConfirmDialog, setOpenCloseConfirmDialog] = useState(false);
  
  // Fetch data for dropdowns in add modal
  const [chains, setChains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeClasses, setStoreClasses] = useState([]);

  // Fetch branches from API
  const fetchBranches = async () => {
    const { chain, category, storeClass } = filterValues;
    
    if (!chain || !category || !storeClass) {
      setRowsState([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/filters/branches`, {
        params: {
          chain,
          category,
          storeClass
        }
      });

      const branches = response.data.items || [];
      setRowsState(branches.map(b => ({
        branchCode: b.branchCode,
        branchName: b.branchName
      })));
      
    } catch (err) {
      console.error('Error fetching branches:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch branches');
      setRowsState([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch branches when filters change
  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.chain, filterValues.category, filterValues.storeClass]);

  // Handle filter changes
  const handleFilterChange = (filters) => {
    setFilterValues(filters);
    setPage(0);
  };

  // Snackbar handler
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

  // Fetch available branches based on selected filters in add modal
  const fetchAvailableBranches = async () => {
    const { chain, category, storeClass } = addBranchForm;
    
    if (!chain || !category || !storeClass) {
      setAvailableBranches([]);
      return;
    }

    try {
      setLoadingBranches(true);
      
      // Use available-branches to fetch only branches where exclusivity is NULL or 0
      const response = await axios.get(`${API_BASE_URL}/filters/available-branches`, {
        params: {
          chain,
          category,
          storeClass
        }
      });

      setAvailableBranches(response.data.items || []);
    } catch (err) {
      console.error('Error fetching available branches:', err);
      setAvailableBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  // Fetch available branches when form changes
  useEffect(() => {
    if (addBranchForm.chain && addBranchForm.category && addBranchForm.storeClass) {
      fetchAvailableBranches();
    } else {
      setAvailableBranches([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addBranchForm.chain, addBranchForm.category, addBranchForm.storeClass]);

  // Filter available branches to exclude already added branches
  const filteredAvailableBranches = useMemo(() => {
    const { chain, category, storeClass } = addBranchForm;
    
    if (!chain || !category || !storeClass) {
      return availableBranches;
    }

    const addedBranchCodes = addedBranches
      .filter(branch => 
        branch.chain === chain && 
        branch.category === category && 
        branch.storeClass === storeClass
      )
      .map(branch => branch.branchCode);

    return availableBranches.filter(branch => !addedBranchCodes.includes(branch.branchCode));
  }, [availableBranches, addedBranches, addBranchForm.chain, addBranchForm.category, addBranchForm.storeClass]);

  // Handle Add Modal
  // Ensure no background element retains focus when opening modals
  const blurActiveElement = () => {
    if (typeof document !== 'undefined' && document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
  };

  const handleOpenAddModal = () => {
    blurActiveElement();
    setOpenAddModal(true);
    setAddBranchForm({
      chain: '',
      category: '',
      storeClass: '',
      branchCode: ''
    });
  };

  const handleCloseAddModal = () => {
    // Check if there's any data in the form or added branches
    const hasFormData = addBranchForm.chain || addBranchForm.category || addBranchForm.storeClass || addBranchForm.branchCode;
    const hasAddedBranches = addedBranches.length > 0;
    
    if (hasFormData || hasAddedBranches) {
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
    setAddBranchForm({
      chain: '',
      category: '',
      storeClass: '',
      branchCode: ''
    });
    setAddedBranches([]);
  };

  const handleCancelCloseAddModal = () => {
    setOpenCloseConfirmDialog(false);
  };

  const handleClearAddForm = () => {
    setAddBranchForm({
      chain: '',
      category: '',
      storeClass: '',
      branchCode: ''
    });
  };

  const handleAddBranchFormChange = (field) => (event) => {
    const value = event.target.value;
    setAddBranchForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'chain' && { category: '', storeClass: '', branchCode: '' }),
      ...(field === 'category' && { storeClass: '', branchCode: '' }),
      ...(field === 'storeClass' && { branchCode: '' })
    }));
  };

  const handleAddBranchToList = () => {
    if (!addBranchForm.chain || !addBranchForm.category || !addBranchForm.storeClass || !addBranchForm.branchCode) {
      alert('Please fill all fields');
      return;
    }

    const selectedBranch = filteredAvailableBranches.find(branch => branch.branchCode === addBranchForm.branchCode) || 
                           availableBranches.find(branch => branch.branchCode === addBranchForm.branchCode);
    
    if (!selectedBranch) {
      alert('Selected branch not found');
      return;
    }

    const isDuplicate = addedBranches.some(
      branch => branch.chain === addBranchForm.chain && 
                branch.category === addBranchForm.category && 
                branch.storeClass === addBranchForm.storeClass && 
                branch.branchCode === addBranchForm.branchCode
    );

    if (isDuplicate) {
      alert('This branch has already been added to the list');
      return;
    }

    // Find the descriptions from the dropdown data
    const selectedChain = chains.find(c => c.chainCode === addBranchForm.chain);
    const selectedCategory = categories.find(cat => 
      (cat.category?.toLowerCase() === addBranchForm.category || cat.catCode?.toLowerCase() === addBranchForm.category)
    );
    const selectedStoreClass = storeClasses.find(sc => sc.storeClassCode === addBranchForm.storeClass);

    const newBranch = {
      chain: addBranchForm.chain,
      chainName: selectedChain?.chainName || addBranchForm.chain,
      category: addBranchForm.category,
      categoryName: selectedCategory?.category || selectedCategory?.catCode || addBranchForm.category,
      storeClass: addBranchForm.storeClass,
      storeClassName: selectedStoreClass?.storeClassification || addBranchForm.storeClass,
      branchCode: selectedBranch.branchCode,
      branchName: selectedBranch.branchName,
      id: Date.now()
    };

    setAddedBranches(prev => [...prev, newBranch]);
    
    // Only clear branchCode, keep chain, category, and storeClass for easy multiple additions
    setAddBranchForm(prev => ({
      ...prev,
      branchCode: ''
    }));
  };

  const handleDeleteAddedBranch = (branchId) => {
    setAddedBranches(prev => prev.filter(branch => branch.id !== branchId));
  };

  const handleSaveAllBranches = async () => {
    if (addedBranches.length === 0) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare branches for API
      const branchesToSave = addedBranches.map(branch => ({
        chain: branch.chain,
        category: branch.category,
        storeClass: branch.storeClass,
        branchCode: branch.branchCode
      }));

      // Call API to save branches
      const response = await axios.post(
        `${API_BASE_URL}/inventory/add-exclusivity-branches`,
        { branches: branchesToSave }
      );

      // Check response status
      if (response.status === 200 || response.status === 207) {
        const { summary, results } = response.data;
        
        // Show notification using Snackbar
        if (summary.success > 0) {
          const successMsg = `Successfully saved ${summary.success} branch(es) to the database!${summary.failed > 0 ? ` ${summary.failed} branch(es) failed.` : ''}`;
          setSnackbar({
            open: true,
            message: successMsg,
            severity: summary.failed > 0 ? 'warning' : 'success'
          });
        }

        // Log any failures for debugging
        if (results.failed && results.failed.length > 0) {
          console.error('Failed branches:', results.failed);
        }

        // Clear added branches and close modal (no confirmation needed)
        setAddedBranches([]);
        setOpenAddModal(false);
        setAddBranchForm({
          chain: '',
          category: '',
          storeClass: '',
          branchCode: ''
        });

        // Refresh the branches list
        await fetchBranches();
      }
    } catch (err) {
      console.error('Error saving branches:', err);
      // Show error notification
      setSnackbar({
        open: true,
        message: err.response?.data?.error || err.message || 'Failed to save branches',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Handlers ---
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

  const handleConfirmDelete = () => {
    if (dialogMode === 'single' && selectedRow) {
      setRowsState((prev) => prev.filter((r) => rowKey(r) !== selectedRow.branchCode));
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedRow.branchCode);
        return newSet;
      });
    } else if (dialogMode === 'multiple') {
      setRowsState((prev) => prev.filter((r) => !selectedRows.has(rowKey(r))));
      setSelectedRows(new Set());
    }
    handleCloseDialog();
  };

  // --- Checkbox Logic ---
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

  // --- Pagination & Filtering ---
  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rowsState;
    return rowsState.filter(
      (r) =>
        r.branchCode.toLowerCase().includes(q) ||
        r.branchName.toLowerCase().includes(q)
    );
  }, [search, rowsState]);

  const pagedRows = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  React.useEffect(() => setPage(0), [search]);

  // --- UI ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Parameter Filter */}
      <Box component="form" noValidate autoComplete="off">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TuneOutlined />
          <strong>Parameter</strong>
        </Box>
        <Filter onChange={handleFilterChange} hideTransaction={true} />
      </Box>

      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              {/* Search + Add Branch + Bulk Delete */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search branches (code or name)"
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
                />

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddModal}
                  sx={{ mr: 2 }}
                >
                  Add Branch
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

              {/* Loading/Error States */}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Table */}
              <TableContainer sx={{ maxHeight: 560 }}>
                <Table stickyHeader aria-label="branches table">
                  <TableHead>
                    <TableRow>
                      {columns.map((col) => (
                        <TableCell
                          key={col.id}
                          sx={{ fontWeight: 'bold' }}
                          style={{ minWidth: col.minWidth }}
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
                              onChange={(e) =>
                                handleSelectAll(e.target.checked, pagedRows)
                              }
                            />
                          ) : (
                            col.label
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pagedRows.map((row, idx) => (
                      <TableRow hover key={`${row.branchCode}-${page}-${idx}`}>
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
                          <Tooltip title="Delete branch">
                            <IconButton
                              color="error"
                              onClick={() => handleOpenDialog(row)}
                            >
                              <DeleteForeverIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}

                    {pagedRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center">
                                          {!filterValues.chain || !filterValues.category || !filterValues.storeClass
                                            ? 'Please select Chain, Category, and Store Classification to view stores.'
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
          </Grid>
        </Grid>
      </Box>

      {/* Confirmation Dialog */}
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

      {/* Add Branch Modal */}
      <Dialog 
        open={openAddModal} 
        onClose={() => {}} 
        disableEscapeKeyDown
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Add Branch</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Chain */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Chain</InputLabel>
                <Select
                  value={addBranchForm.chain}
                  onChange={handleAddBranchFormChange('chain')}
                  label="Chain"
                >
                  <MenuItem value="">Select Chain</MenuItem>
                  {chains.map(chain => (
                    <MenuItem key={chain.chainCode} value={chain.chainCode}>
                      {chain.chainName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Category */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={addBranchForm.category}
                  onChange={handleAddBranchFormChange('category')}
                  label="Category"
                  disabled={!addBranchForm.chain}
                >
                  <MenuItem value="">Select Category</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.catCode || cat.category || cat.id} value={cat.category?.toLowerCase() || cat.catCode?.toLowerCase()}>
                      {cat.category || cat.catCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Store Classification */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Store Classification</InputLabel>
                <Select
                  value={addBranchForm.storeClass}
                  onChange={handleAddBranchFormChange('storeClass')}
                  label="Store Classification"
                  disabled={!addBranchForm.category}
                >
                  <MenuItem value="">Select Store Class</MenuItem>
                  {storeClasses.map(sc => (
                    <MenuItem key={sc.storeClassCode || sc.id} value={sc.storeClassCode}>
                      {sc.storeClassification || sc.storeClassCode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Branch Code - Autocomplete */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                size="small"
                options={filteredAvailableBranches}
                getOptionLabel={(option) => `${option.branchCode} - ${option.branchName}`}
                value={filteredAvailableBranches.find(b => b.branchCode === addBranchForm.branchCode) || null}
                onChange={(event, newValue) => {
                  setAddBranchForm(prev => ({
                    ...prev,
                    branchCode: newValue ? newValue.branchCode : ''
                  }));
                }}
                disabled={!addBranchForm.storeClass}
                loading={loadingBranches}
                filterOptions={(options, { inputValue }) => {
                  const query = inputValue.toLowerCase();
                  return options.filter(option => 
                    option.branchCode.toLowerCase().includes(query) ||
                    option.branchName.toLowerCase().includes(query)
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Branch Code"
                    placeholder="Search by code or name"
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
              />
            </Grid>

            {/* Add to List and Clear Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleAddBranchToList}
                  disabled={!addBranchForm.chain || !addBranchForm.category || !addBranchForm.storeClass || !addBranchForm.branchCode}
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

            {/* Added Branches Table */}
            {addedBranches.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Added Branches
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Chain</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Store Class</strong></TableCell>
                        <TableCell><strong>Branch Code</strong></TableCell>
                        <TableCell><strong>Branch Name</strong></TableCell>
                        <TableCell align="center"><strong>Action</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {addedBranches
                        .slice(addedBranchesPage * addedBranchesRowsPerPage, addedBranchesPage * addedBranchesRowsPerPage + addedBranchesRowsPerPage)
                        .map((branch) => (
                          <TableRow key={branch.id}>
                            <TableCell>{branch.chainName || branch.chain}</TableCell>
                            <TableCell>{branch.categoryName || branch.category}</TableCell>
                            <TableCell>{branch.storeClassName || branch.storeClass}</TableCell>
                            <TableCell>{branch.branchCode}</TableCell>
                            <TableCell>{branch.branchName}</TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteAddedBranch(branch.id)}
                              >
                                <DeleteForeverIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
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
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddModal} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={addedBranches.length === 0 || loading}
            onClick={handleSaveAllBranches}
          >
            {loading ? 'Saving...' : `Save All (${addedBranches.length})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Add Modal Confirmation Dialog */}
      <Dialog open={openCloseConfirmDialog} onClose={handleCancelCloseAddModal}>
        <DialogTitle>Confirm Close</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved data. All inputs and added branches will be cleared. Do you want to continue?
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

      {/* Snackbar for feedback (consistent with ItemMaintenance) */}
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
