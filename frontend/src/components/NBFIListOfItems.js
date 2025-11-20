import * as React from 'react';
import {
  TextField, TableRow, TablePagination, TableHead, TableContainer,
  TableCell, TableBody, Table, Paper, Box, InputAdornment, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import useNBFIItems from '../hooks/useNBFIItems';

const columns = [
  { id: 'itemCode', label: 'Item Code', width: 200 },
  { id: 'description', label: 'Description', width: 600 },
  { id: 'quantity', label: 'Quantity', width: 200 },
];

function createData(itemCode, description, quantity) {
  return { itemCode, description, quantity };
}
const rowKey = (r) => `${r.itemCode}|${r.description}`;

export default function NBFIListOfItems({ filters, quantities = {}, setQuantities }) {

  const { items, loading, error } = useNBFIItems(filters);

  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Only show items where inExclusivity is true
  const rows = React.useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items
      .filter((it) => it.inExclusivity)
      .map((it) => {
        const itemCode = it.itemCode || '';
        const description = it.itemDescription ?? it.description ?? '';
        return createData(itemCode, description, 0);
      });
  }, [items]);

  React.useEffect(() => {
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      rows.forEach((r) => {
        const key = rowKey(r);
        if (!(key in newQuantities)) {
          const n = Number(r.quantity);
          newQuantities[key] = Number.isFinite(n) ? n : 0;
        }
      });
      return newQuantities;
    });
    setPage(0);
  }, [rows, setQuantities]);

  const handleChangePage = (_event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.itemCode || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q)
    );
  }, [search, rows]);

  const pagedRows = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  React.useEffect(() => { setPage(0); }, [search]);

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

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth size="small" label="Search items (code or description)"
          placeholder="e.g., 1039… or 'wireless mouse'"
          value={search} onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearch('')} edge="end"><ClearIcon /></IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      <TableContainer>
        <Table stickyHeader aria-label="nbfi items table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} style={{ minWidth: column.width }} sx={{ fontWeight: 'bold' }}>
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length}>Loading items…</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={columns.length} style={{ color: 'red' }}>{error}</TableCell></TableRow>
            ) : pagedRows.map((row, idx) => {
              const key = rowKey(row);
              return (
                <TableRow hover tabIndex={-1} key={key}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    if (column.id === 'quantity') {
                      const qtyVal = quantities[key] ?? 0;
                      return (
                        <TableCell key={`${key}-${column.id}`}>
                          <TextField value={qtyVal} onChange={handleQtyChange(key)} onBlur={handleQtyBlur(key)}
                            onWheel={preventWheelChange} size="small" type="number" inputProps={{ min: 0, step: 1 }}
                            fullWidth variant="outlined" placeholder="0" />
                        </TableCell>
                      );
                    }
                    return <TableCell key={`${key}-${column.id}`}>{value}</TableCell>;
                  })}
                </TableRow>
              );
            })}
            {!loading && pagedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                  No results found{search ? ` for "${search}"` : ''}.
                  </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination rowsPerPageOptions={[10,25,100]} component="div" count={filtered.length}
        rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
    </Paper>
  );
}
