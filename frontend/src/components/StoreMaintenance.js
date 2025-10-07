import * as React from 'react';
import {
  Box, Paper, TextField, Grid, IconButton, Table, TableBody, TableContainer,
  TableHead, TableRow, TableCell, TablePagination, Tooltip, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Checkbox, Stack
} from '@mui/material';
import {
  TuneOutlined, Search as SearchIcon, Clear as ClearIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import Filter from '../components/Filter';

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
  const [rowsState, setRowsState] = React.useState(initialRows);
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [selectedRows, setSelectedRows] = React.useState(new Set());
  const [openDialog, setOpenDialog] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState('single'); // 'single' or 'multiple'
  const [selectedRow, setSelectedRow] = React.useState(null);

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
        <Filter />
      </Box>

      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              {/* Search + Bulk Delete */}
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
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={handleOpenBulkDialog}
                  disabled={selectedRows.size === 0}
                >
                  Delete Selected ({selectedRows.size})
                </Button>
              </Stack>

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
    </Box>
  );
}
