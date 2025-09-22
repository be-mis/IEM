import * as React from 'react';
import {TextField, TableRow, TablePagination, TableHead, TableContainer, TableCell, TableBody, Table, Paper
} from '@mui/material';

const columns = [
  { id: 'itemCode', label: 'Item Code', width: 200 },
  { id: 'description', label: 'Description', width: 600 },
  { id: 'quantity', label: 'Quantity', width: 200 },
];

// Slim createData to what you actually use
function createData(itemCode, description, quantity) {
  return { itemCode, description, quantity };
}

const rows = [
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
  createData('1023987456123987', 'Scented soy candle with calming lavender aroma.', 11),
  createData('1034567890234561', 'Classic black ballpoint pen with smooth ink flow.', 3),
  createData('1049871234567812', 'Foldable umbrella with wind-resistant frame.', 15),
  createData('1052310987654320', 'Travel-sized power bank with fast charging.', 6),
  createData('1067890123456789', 'Insulated coffee tumbler with spill-proof lid.', 7),
  createData('1073456789012345', 'Minimalist wristwatch with stainless steel strap.', 2),
  createData('1088765432109876', 'Soft throw blanket made of plush fleece.', 9),
  createData('1092345678901234', 'Noise-cancelling over-ear headphones.', 5),
  createData('1092345678901234', 'Pocket-sized hand sanitizer with refreshing scent.', 4), // duplicate itemCode on purpose
];

export default function StickyHeadTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // Keep editable quantity values per row (as numbers). Use index to avoid collisions.
  const [quantities, setQuantities] = React.useState(() =>
    Object.fromEntries(rows.map((r, idx) => [idx, Number(r.quantity) ?? 0]))
  );

  const handleChangePage = (_event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // Update as user types; allow empty string temporarily for UX
  const handleQtyChange = (rowIdx) => (e) => {
    const val = e.target.value;
    // Accept empty string; otherwise coerce to number but do not clamp yet
    setQuantities((prev) => ({ ...prev, [rowIdx]: val === '' ? '' : Number(val) }));
  };

  // Normalize on blur: clamp to >= 0 and integer
  const handleQtyBlur = (rowIdx) => () => {
    setQuantities((prev) => {
      let v = prev[rowIdx];
      if (v === '' || isNaN(v)) v = 0;
      v = Math.max(0, Math.trunc(Number(v)));
      return { ...prev, [rowIdx]: v };
    });
  };

  const preventWheelChange = (e) => {
    // Prevent scroll wheel from changing the number while focused
    e.target.blur();
    setTimeout(() => e.target.focus(), 0);
  };

  const pagedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                  style={{ minWidth: column.width }} // ✅ apply defined width
                  sx={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.map((row, localIdx) => {
              const globalIdx = page * rowsPerPage + localIdx;
              const compositeKey = `${row.itemCode}|${row.description}|${globalIdx}`; // ✅ unique even if itemCode duplicates
              return (
                <TableRow hover tabIndex={-1} key={compositeKey}>
                  {columns.map((column) => {
                    const value = row[column.id];

                    if (column.id === 'quantity') {
                      const qtyVal = quantities[globalIdx] ?? 0;
                      return (
                        <TableCell key={`${compositeKey}-${column.id}`} align={column.align}>
                          <TextField
                            value={qtyVal}
                            onChange={handleQtyChange(globalIdx)}
                            onBlur={handleQtyBlur(globalIdx)}
                            onWheel={preventWheelChange}
                            size="small"
                            type="number"
                            inputProps={{ min: 0, step: 1 }}
                            fullWidth
                            variant="outlined"
                            placeholder="0"
                          />
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={`${compositeKey}-${column.id}`} align={column.align}>
                        {value}
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
