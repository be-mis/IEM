import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

const columns = [
  { id: 'branchCode', label: 'Branch Code', width: 500 },
  { id: 'branchName', label: 'Branch Name', width: 500 },
];

function createData(branchCode, branchName, population, size) {
  const density = population / size;
  return { branchCode, branchName, population, size, density };
}

const rows = [
  createData('C-RDS001', 'Robinson Dept Store 1'),
  createData('C-RDS002', 'Robinson Dept Store 2'),
  createData('C-RDS003', 'Robinson Dept Store 3'),
  createData('C-RDS004', 'Robinson Dept Store 4'),
  createData('C-RDS005', 'Robinson Dept Store 5'),
  createData('C-RDS006', 'Robinson Dept Store 6'),
  createData('C-RDS007', 'Robinson Dept Store 7'),
  createData('C-RDS008', 'Robinson Dept Store 8'),
  createData('C-RDS009', 'Robinson Dept Store 9'),
  createData('C-RDS0010', 'Robinson Dept Store 10'),
  createData('C-RDS0011', 'Robinson Dept Store 11'),
  createData('C-RDS0012', 'Robinson Dept Store 12'),
  createData('C-RDS0013', 'Robinson Dept Store 13'),
  createData('C-RDS0014', 'Robinson Dept Store 14'),
  createData('C-RDS0015', 'Robinson Dept Store 15'),
  createData('C-RDS0016', 'Robinson Dept Store 16'),
  createData('C-RDS0017', 'Robinson Dept Store 17'),
  createData('C-RDS0018', 'Robinson Dept Store 18'),
  createData('C-RDS0019', 'Robinson Dept Store 19'),
];

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth }}
                sx={{ fontWeight: 'bold' }}
                >
                    {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}