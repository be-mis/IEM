import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Paper, TextField, IconButton, Table, TableBody, TableContainer, TableHead,
  TableRow, TableCell, TablePagination, InputAdornment, Grid, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Checkbox, Stack
} from '@mui/material';
import {
  TuneOutlined, Search as SearchIcon, Clear as ClearIcon,
  DeleteForever as DeleteForeverIcon
} from '@mui/icons-material';
import Filter from '../components/Filter';

const columns = [
  { id: 'select', label: '', width: 50 },
  { id: 'itemCode', label: 'Item Code', width: 200 },
  { id: 'description', label: 'Description', width: 600 },
  { id: 'quantity', label: 'Quantity', width: 200 },
  { id: 'action', label: 'Action', width: 120 }
];

function createData(itemCode, description, quantity) {
  return { itemCode, description, quantity };
}

const rowKey = (r) => `${r.itemCode}|${r.description}`;

const initialRows = [
  createData('1016235984723905', 'Classic white cotton T-shirt for everyday wear.', 9),
  createData('1024578391027456', 'Compact wireless mouse with silent clicks.', 5),
  createData('1039827564312087', 'Durable stainless steel water bottle, 500 ml.', 12),
  createData('1047312098456723', 'Portable Bluetooth speaker with deep bass.', 7),
  createData('1056743210985674', 'Soft microfiber towel, quick-dry and lightweight.', 14),
  createData('1062039485712348', 'Rechargeable LED desk lamp with touch control.', 6),
  createData('1078456902134590', 'Leather wallet with multiple card slots.', 10),
  createData('1089123456702341', 'Slim laptop sleeve fits up to 15-inch devices.', 4),
  createData('1095634789201576', 'Eco-friendly reusable shopping bag.', 8),
  createData('1010846235792345', 'Adjustable phone stand for desk or nightstand.', 13),
  createData('1089123456702341', 'Slim laptop sleeve fits up to 15-inch devices.', 4),
  createData('1095634789201576', 'Eco-friendly reusable shopping bag.', 8),
  createData('1010846235792345', 'Adjustable phone stand for desk or nightstand.', 13),
];

export default function ItemMaintenance() {
  const [rowsState, setRowsState] = useState(initialRows);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(initialRows.map((r) => [rowKey(r), Number(r.quantity) ?? 0]))
  );

  // Selection + delete dialog states
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('single'); // 'single' or 'multiple'
  const [selectedRow, setSelectedRow] = useState(null);

  // --- Handlers ---
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
      const key = rowKey(selectedRow);
      setRowsState((prev) => prev.filter((r) => rowKey(r) !== key));
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    } else if (dialogMode === 'multiple') {
      setRowsState((prev) => prev.filter((r) => !selectedRows.has(rowKey(r))));
      setSelectedRows(new Set());
    }
    handleCloseDialog();
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
        <Filter />
      </Box>

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
                    <TableCell>
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
                    </TableCell>
                    <TableCell align="center">
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
    </Box>
  );
}
