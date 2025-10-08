import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useBranches } from '../hooks/useBranches';
// Columns (align with ListOfItems style)
const columns = [
  { id: 'branchCode', label: 'Branch Code', minWidth: 180 },
  { id: 'branchName', label: 'Branch Name', minWidth: 220 },
];

// Sample rows; keep your real data shape the same
// const rows = [
//   { branchCode: 'C-RDS001', branchName: 'Robinson Dept Store 1' },
//   { branchCode: 'C-RDS002', branchName: 'Robinson Dept Store 2' },
//   { branchCode: 'C-RDS003', branchName: 'Robinson Dept Store 3' },
//   { branchCode: 'C-RDS004', branchName: 'Robinson Dept Store 4' },
//   { branchCode: 'C-RDS005', branchName: 'Robinson Dept Store 5' },
//   { branchCode: 'C-RDS006', branchName: 'Robinson Dept Store 6' },
//   { branchCode: 'C-RDS007', branchName: 'Robinson Dept Store 7' },
//   { branchCode: 'C-RDS008', branchName: 'Robinson Dept Store 8' },
//   { branchCode: 'C-RDS009', branchName: 'Robinson Dept Store 9' },
//   { branchCode: 'C-RDS0010', branchName: 'Robinson Dept Store 10' },
//   { branchCode: 'C-RDS0011', branchName: 'Robinson Dept Store 11' },
//   { branchCode: 'C-RDS0012', branchName: 'Robinson Dept Store 12' },
//   { branchCode: 'C-RDS0013', branchName: 'Robinson Dept Store 13' },
//   { branchCode: 'C-RDS0014', branchName: 'Robinson Dept Store 14' },
//   { branchCode: 'C-RDS0015', branchName: 'Robinson Dept Store 15' },
//   { branchCode: 'C-RDS0016', branchName: 'Robinson Dept Store 16' },
//   { branchCode: 'C-RDS0017', branchName: 'Robinson Dept Store 17' },
//   { branchCode: 'C-RDS0018', branchName: 'Robinson Dept Store 18' },
//   { branchCode: 'C-RDS0019', branchName: 'Robinson Dept Store 19' },
// ];

export default function StickyHeadTable({ filters }) {

  const { branches, loading, error } = useBranches(filters);

  // Search text
  const [search, setSearch] = React.useState('');
  // Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Filter rows based on search (branch code or name)
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = Array.isArray(branches) ? branches : [];

    if (!q) return source;
    return source.filter(r =>
        (r.branchCode || '').toLowerCase().includes(q) ||
        (r.branchName || '').toLowerCase().includes(q)
    );
  }, [search, branches]);

  // Slice for pagination AFTER filtering
  const pagedRows = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  // Reset to first page when search changes so you see top matches
  React.useEffect(() => {
    setPage(0);
  }, [search]);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Search bar */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Search branches (code or name)"
          placeholder="e.g., C-RDS003 or Robinson"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon aria-label="search icon" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={() => setSearch('')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      {/* Loading / Error states */}
      {loading && <Box sx={{ px: 2, pb: 1 }}>Loading branches…</Box>}
      {error && !loading && <Box sx={{ px: 2, pb: 1, color: 'error.main' }}>{String(error)}</Box>}

      <TableContainer>
        <Table stickyHeader aria-label="branches table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sx={{ fontWeight: 'bold' }}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedRows.map((row, idx) => (
              <TableRow
                hover
                tabIndex={-1}
                key={`${row.branchCode}-${page}-${idx}`}
              >
                {columns.map((column) => (
                  <TableCell key={column.id}>
                    {row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {pagedRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
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
  );
}
