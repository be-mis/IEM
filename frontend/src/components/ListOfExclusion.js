import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TablePagination from '@mui/material/TablePagination';
import InputAdornment from '@mui/material/InputAdornment';
import IconButtonMui from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import Tooltip from '@mui/material/Tooltip';

/**
 * ===========================
 * Types (JSDoc for .js files)
 * ===========================
 */

/**
 * @typedef {Object} Branch
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string[]} excludedItemIds
 */

/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * =================================
 * Pure helpers (small & testable)
 * =================================
 */

/** @param {Branch} branch @param {Item[]} items */
export function getExcludedItems(branch, items) {
  return items.filter((i) => branch.excludedItemIds.includes(i.id));
}

/** @param {Branch} branch @param {Item[]} items @param {string} q */
export function getAvailableItemsForBranch(branch, items, q) {
  const query = q.trim().toLowerCase();
  return items
    .filter((i) => !branch.excludedItemIds.includes(i.id))
    .filter(
      (i) =>
        !query ||
        i.code.toLowerCase().includes(query) ||
        i.name.toLowerCase().includes(query),
    );
}

/** @param {Branch} branch @param {string} itemId */
export function addExcludedItem(branch, itemId) {
  if (branch.excludedItemIds.includes(itemId)) return branch;
  return { ...branch, excludedItemIds: [...branch.excludedItemIds, itemId] };
}

/** @param {Branch} branch @param {string} itemId */
export function removeExcludedItem(branch, itemId) {
  return {
    ...branch,
    excludedItemIds: branch.excludedItemIds.filter((id) => id !== itemId),
  };
}

/**
 * Debounce hook for inputs (default ~250ms)
 * @template T
 * @param {T} value
 * @param {number} delayMs
 * @returns {T}
 */
function useDebouncedValue(value, delayMs = 250) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

/**
 * ============================================
 * Example fallback data (used if no props in)
 * ============================================
 */

/** @type {Item[]} */
const DEFAULT_ITEMS = [
  { id: 'i1', code: 'ITM-001', name: 'Black T-Shirt' },
  { id: 'i2', code: 'ITM-002', name: 'Blue Jeans' },
  { id: 'i3', code: 'ITM-003', name: 'Red Dress' },
  { id: 'i4', code: 'ITM-004', name: 'Sports Bra' },
  { id: 'i5', code: 'ITM-005', name: 'Buggy Jeans' },
  { id: 'i6', code: 'ITM-006', name: 'Fur Jacket' },
  { id: 'i7', code: 'ITM-007', name: 'White Sando' },
  { id: 'i8', code: 'ITM-008', name: 'Skinny Jeans' },
  { id: 'i9', code: 'ITM-009', name: 'Balck and White Coat' },
  { id: 'i10', code: 'ITM-010', name: 'Black Slacks' },
  { id: 'i11', code: 'ITM-011', name: 'Violet Pearl Hat' },
  { id: 'i12', code: 'ITM-012', name: 'Green Necktie' },
];

/** @type {Branch[]} */
const DEFAULT_BRANCHES = [
  { id: 'b1', code: 'C-RDS001', name: 'Robinson Dept Store 1', excludedItemIds: [] },
  { id: 'b2', code: 'C-RDS002', name: 'Robinson Dept Store 2', excludedItemIds: [] },
  { id: 'b3', code: 'C-RDS003', name: 'Robinson Dept Store 3', excludedItemIds: [] },
  { id: 'b4', code: 'C-RDS004', name: 'Robinson Dept Store 4', excludedItemIds: [] },
  { id: 'b5', code: 'C-RDS005', name: 'Robinson Dept Store 5', excludedItemIds: [] },
  { id: 'b6', code: 'C-RDS006', name: 'Robinson Dept Store 6', excludedItemIds: [] },
  { id: 'b7', code: 'C-RDS007', name: 'Robinson Dept Store 7', excludedItemIds: [] },
  { id: 'b8', code: 'C-RDS008', name: 'Robinson Dept Store 8', excludedItemIds: [] },
  { id: 'b9', code: 'C-RDS009', name: 'Robinson Dept Store 9', excludedItemIds: [] },
  { id: 'b10', code: 'C-RDS010', name: 'Robinson Dept Store 10', excludedItemIds: [] },
  { id: 'b11', code: 'C-RDS011', name: 'Robinson Dept Store 11', excludedItemIds: [] },
  { id: 'b12', code: 'C-RDS012', name: 'Robinson Dept Store 12', excludedItemIds: [] },
];

/**
 * ============================
 * Branch Row (sub-component)
 * ============================
 */
function BranchRow({ branch, items, onUpdateBranch }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [selectedItemId, setSelectedItemId] = React.useState('');

  const excludedItems = React.useMemo(
    () => getExcludedItems(branch, items),
    [branch, items],
  );

  // Provide ALL non-excluded items; MUI will filter popup as you type.
  const availableItems = React.useMemo(
    () => getAvailableItemsForBranch(branch, items, /* q */ ''),
    [branch, items],
  );

  const selectedOption = React.useMemo(
    () => availableItems.find((i) => i.id === selectedItemId) || null,
    [availableItems, selectedItemId],
  );

  const handleAdd = React.useCallback(() => {
    if (!selectedOption) return;
    const updated = addExcludedItem(branch, selectedOption.id);
    onUpdateBranch(updated);
    setSelectedItemId('');
    setQuery('');
  }, [branch, onUpdateBranch, selectedOption]);

  const handleRemove = React.useCallback(
    (itemId) => {
      const updated = removeExcludedItem(branch, itemId);
      onUpdateBranch(updated);
    },
    [branch, onUpdateBranch],
  );

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width={56}>
          <IconButton
            aria-label={`Toggle excluded items for ${branch.code}`}
            size="small"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        {/* Branch Code */}
        <TableCell component="th" scope="row" sx={{ whiteSpace: 'nowrap' }}>
          {branch.code}
        </TableCell>

        {/* Branch Name */}
        <TableCell sx={{ minWidth: 220 }}>{branch.name}</TableCell>

        {/* Action cell: Autocomplete (select-like) + Add */}
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Autocomplete
              size="small"
              sx={{ flex: 1, minWidth: 280 }}
              options={availableItems}
              value={selectedOption}
              onChange={(_, newValue) => setSelectedItemId(newValue?.id || '')}
              inputValue={query}
              onInputChange={(_, newInput) => setQuery(newInput)}
              getOptionLabel={(opt) => (opt ? `${opt.code} — ${opt.name}` : '')}
              isOptionEqualToValue={(opt, val) => !!val && opt.id === val.id}
              noOptionsText={query ? 'No matching items' : 'No available items'}
              clearOnBlur={false}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select item (search by code/name)"
                  placeholder="e.g., ITM-001 or Black T-Shirt"
                  autoComplete="off"
                  aria-label={`Select item to exclude for ${branch.code}`}
                />
              )}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!selectedOption}
              aria-label={`Add excluded item to ${branch.code}`}
            >
              Add to Excluded
            </Button>
          </Stack>
        </TableCell>
      </TableRow>

      {/* Sub-table: Excluded Items (unchanged) */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1 }}>
              <Typography variant="subtitle1" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                Excluded Items for {branch.code}
              </Typography>

              <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
                <Table size="small" aria-label={`Excluded items table for ${branch.code}`}>
                  <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 180 }}>Item Code</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell sx={{ width: 160 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {excludedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" color="text.secondary">
                          No excluded items yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    excludedItems.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell component="th" scope="row">
                          {it.code}
                        </TableCell>
                        <TableCell>{it.name}</TableCell>
                        <TableCell>
                          <Tooltip title="Remove item">
                            <IconButton 
                              color="error"
                              onClick={() => handleRemove(it.id)}
                              aria-label={`Remove ${it.code} from ${branch.code} exclusions`}
                            >
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
              <Divider sx={{ mt: 2 }} />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

BranchRow.propTypes = {
  branch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    excludedItemIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onUpdateBranch: PropTypes.func.isRequired,
};

/**
 * ============================
 * Main Component
 * ============================
 */

/**
 * Collapsible table of branches with per-row excluded items manager.
 *
 * Props are optional; if omitted, local example data is used.
 *
 * @param {{ branches?: Branch[], items?: Item[], onBranchesChange?: (branches: Branch[]) => void }} props
 */
export default function ListOfExclusion(props) {
  // Source data
  const [branches, setBranches] = React.useState(
    () => props.branches?.map((b) => ({ ...b })) || DEFAULT_BRANCHES
  );
  const items = props.items || DEFAULT_ITEMS;

  // ✅ keep local state in sync when parent provides new fetched branches
  React.useEffect(() => {
    if (Array.isArray(props.branches)) {
      setBranches(props.branches.map(b => ({ ...b })));
    }
  }, [props.branches]);
  
  // ✅ NEW: Notify parent component when branches (exclusions) change
  React.useEffect(() => {
    if (props.onBranchesChange && typeof props.onBranchesChange === 'function') {
      props.onBranchesChange(branches);
    }
  }, [branches, props.onBranchesChange]);
  
  // --- Search (MAIN TABLE ONLY) ---
  const [search, setSearch] = React.useState('');
  const debouncedSearch = useDebouncedValue(search, 200);

  // Filter branches by code or name (case-insensitive)
  const filteredBranches = React.useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(
      (b) =>
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q)
    );
  }, [branches, debouncedSearch]);

  // --- Pagination (apply AFTER filtering) ---
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (_event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  React.useEffect(() => {
    // When search changes, jump to first page to show top matches
    setPage(0);
  }, [debouncedSearch]);

  const pagedBranches = React.useMemo(
    () =>
      filteredBranches.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      ),
    [filteredBranches, page, rowsPerPage]
  );

  /** Update a single branch immutably */
  const handleUpdateBranch = React.useCallback((updated) => {
    setBranches((prev) =>
      prev.map((b) =>
        b.id === updated.id && b.code === updated.code && b.name === updated.name
          ? updated
          : b
      )
    );
  }, []);

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', maxHeight: 550 }}>
      {/* MAIN search (affects only the branch list, not the subtable) */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Search branches (code or name)"
          placeholder="e.g., C-RDS001 or Robinson"
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
                <IconButtonMui
                  aria-label="clear search"
                  onClick={() => setSearch('')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButtonMui>
              </InputAdornment>
            ) : null,
          }}
        />
      </Box>

      <TableContainer sx={{ overflow: 'auto', maxHeight: 400 }}>
        <Table aria-label="Branch exclusions table" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 56 }} />
              <TableCell>Branch Code</TableCell>
              <TableCell>Branch Name</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedBranches.map((branch, localIdx) => {
              const globalIdx = page * rowsPerPage + localIdx;
              const key = `${branch.id}-${branch.code}-${globalIdx}`; // unique even if IDs repeat
              return (
                <BranchRow
                  key={key}
                  branch={branch}
                  items={items}
                  onUpdateBranch={handleUpdateBranch}
                />
              );
            })}

            {pagedBranches.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>
                  <Typography variant="body2" align="center">
                    No branches found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredBranches.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}