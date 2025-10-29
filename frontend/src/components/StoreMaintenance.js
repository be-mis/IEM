import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import {
  Box, Paper, TextField, Grid, IconButton, Table, TableBody, TableContainer,
  TableHead, TableRow, TableCell, TablePagination, Tooltip, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Checkbox, Stack, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, Typography, Autocomplete
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

const initialRows = [
  { branchCode: 'C-RDS001', branchName: 'Robinson Dept Store 1' },
  { branchCode: 'C-RDS002', branchName: 'Robinson Dept Store 2' },
  { branchCode: 'C-RDS003', branchName: 'Robinson Dept Store 3' },
  { branchCode: 'C-RDS004', branchName: 'Robinson Dept Store 4' },
  { branchCode: 'C-RDS005', branchName: 'Robinson Dept Store 5' },
  { branchCode: 'C-RDS006', branchName: 'Robinson Dept Store 6' },
  { branchCode: 'C-RDS007', branchName: 'Robinson Dept Store 7' },
  { branchCode: 'C-RDS008', branchName: 'Robinson Dept Store 8' },
  { branchCode: 'C-RDS009', branchName: 'Robinson Dept Store 9' },
  { branchCode: 'C-RDS010', branchName: 'Robinson Dept Store 10' },
  { branchCode: 'C-RDS011', branchName: 'Robinson Dept Store 11' },
  { branchCode: 'C-RDS012', branchName: 'Robinson Dept Store 12' },
  { branchCode: 'C-RDS013', branchName: 'Robinson Dept Store 13' },
  { branchCode: 'C-RDS014', branchName: 'Robinson Dept Store 14' },
  { branchCode: 'C-RDS015', branchName: 'Robinson Dept Store 15' },
];

const rowKey = (r) => r.branchCode;

export default function StoreMaintenance() {
  const [rowsState, setRowsState] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterValues, setFilterValues] = useState({
    chain: '',
    category: '',
    storeClass: '',
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
  const handleOpenAddModal = () => {
    setOpenAddModal(true);
    setAddBranchForm({
      chain: '',
      category: '',
      storeClass: '',
      branchCode: ''
    });
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
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

    const newBranch = {
      chain: addBranchForm.chain,
      category: addBranchForm.category,
      storeClass: addBranchForm.storeClass,
      branchCode: selectedBranch.branchCode,
      branchName: selectedBranch.branchName,
      id: Date.now()
    };

    setAddedBranches(prev => [...prev, newBranch]);
    
    setAddBranchForm({
      chain: '',
      category: '',
      storeClass: '',
      branchCode: ''
    });
  };

  const handleDeleteAddedBranch = (branchId) => {
    setAddedBranches(prev => prev.filter(branch => branch.id !== branchId));
  };

  // --- Delete Handlers ---
  const handleOpenDialog = (row) => {
    setDialogMode('single');
    setSelectedRow(row);
    setOpenDialog(true);
  };

  const handleOpenBulkDialog = () => {
    if (selectedRows.size === 0) return;
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
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, gap: 2 }}>
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
              <TableContainer sx={{ height: 560 }}>
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
                          No results found{search ? ` for “${search}”` : ''}.
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
      <Dialog open={openAddModal} onClose={handleCloseAddModal} maxWidth="md" fullWidth>
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
                      {chain.chainCode} - {chain.chainName}
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

            {/* Add to List Button */}
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddBranchToList}
                disabled={!addBranchForm.chain || !addBranchForm.category || !addBranchForm.storeClass || !addBranchForm.branchCode}
              >
                Add to List
              </Button>
            </Grid>

            {/* Added Branches Table */}
            {addedBranches.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Added Branches ({addedBranches.length})
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Chain</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Store Class</TableCell>
                        <TableCell>Branch Code</TableCell>
                        <TableCell>Branch Name</TableCell>
                        <TableCell align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {addedBranches.map((branch) => (
                        <TableRow key={branch.id}>
                          <TableCell>{branch.chain}</TableCell>
                          <TableCell>{branch.category}</TableCell>
                          <TableCell>{branch.storeClass}</TableCell>
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
            disabled={addedBranches.length === 0}
          >
            Save All Branches
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
