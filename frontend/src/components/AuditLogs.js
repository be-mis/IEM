import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TextField, InputAdornment, IconButton,
  Typography, Chip, FormControl, InputLabel, Select, MenuItem, Grid,
  CircularProgress, Alert, Collapse, Card, CardContent
} from '@mui/material';
import {
  Search as SearchIcon, Clear as ClearIcon, ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon, FilterList as FilterListIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    userName: ''
  });

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/audit/logs`, {
        params: {
          limit: 1000, // Fetch more for client-side filtering
          ...filters
        }
      });

      setLogs(response.data.logs || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply filters when they change
  useEffect(() => {
    if (!loading) {
      fetchAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.entityType, filters.action, filters.userName]);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return logs;

    return logs.filter(log => 
      log.entity_name?.toLowerCase().includes(searchLower) ||
      log.user_name?.toLowerCase().includes(searchLower) ||
      log.entity_type?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower) ||
      log.ip_address?.toLowerCase().includes(searchLower) ||
      log.details?.toLowerCase().includes(searchLower)
    );
  }, [logs, search]);

  // Paginate
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredLogs, page, rowsPerPage]);

  // Get unique values for filters
  const uniqueEntityTypes = useMemo(() => {
    return [...new Set(logs.map(log => log.entity_type).filter(Boolean))].sort();
  }, [logs]);

  const uniqueActions = useMemo(() => {
    return [...new Set(logs.map(log => log.action).filter(Boolean))].sort();
  }, [logs]);

  const uniqueUserNames = useMemo(() => {
    return [...new Set(logs.map(log => log.user_name).filter(Boolean))].sort();
  }, [logs]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExpandRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action) => {
    if (!action) return 'default';
    const actionLower = action.toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('insert')) return 'success';
    if (actionLower.includes('update') || actionLower.includes('edit')) return 'info';
    if (actionLower.includes('delete') || actionLower.includes('remove')) return 'error';
    if (actionLower.includes('login')) return 'primary';
    return 'default';
  };

  const parseDetails = (detailsString) => {
    try {
      return JSON.parse(detailsString);
    } catch {
      return detailsString;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" gutterBottom>
          Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View and monitor all system activities and changes
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label="Search logs"
              placeholder="Search by user, action, entity, IP address..."
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
                    <IconButton onClick={() => setSearch('')} edge="end" size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              onClick={() => setShowFilters(!showFilters)}
              color={showFilters ? 'primary' : 'default'}
            >
              <FilterListIcon />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1, alignSelf: 'center' }}>
              {filteredLogs.length} log{filteredLogs.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
        </Grid>

        {/* Filters */}
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Entity Type</InputLabel>
                  <Select
                    value={filters.entityType}
                    label="Entity Type"
                    onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {uniqueEntityTypes.map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={filters.action}
                    label="Action"
                    onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {uniqueActions.map(action => (
                      <MenuItem key={action} value={action}>{action}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>User</InputLabel>
                  <Select
                    value={filters.userName}
                    label="User"
                    onChange={(e) => setFilters(prev => ({ ...prev, userName: e.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {uniqueUserNames.map(user => (
                      <MenuItem key={user} value={user}>{user}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Logs Table */}
      {!loading && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={50}></TableCell>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Entity Type</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                  <TableCell><strong>Entity Name</strong></TableCell>
                  <TableCell><strong>IP Address</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      {search || filters.entityType || filters.action || filters.userName
                        ? 'No logs match your search criteria'
                        : 'No audit logs found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow hover sx={{ cursor: 'pointer' }}>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleExpandRow(log.id)}
                          >
                            {expandedRow === log.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{formatDate(log.created_at)}</TableCell>
                        <TableCell>{log.user_name || 'System'}</TableCell>
                        <TableCell>
                          <Chip label={log.entity_type} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={log.action} 
                            size="small" 
                            color={getActionColor(log.action)}
                          />
                        </TableCell>
                        <TableCell>{log.entity_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                            {log.ip_address || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                      
                      {/* Expanded Details Row */}
                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, borderBottom: expandedRow === log.id ? undefined : 0 }}>
                          <Collapse in={expandedRow === log.id} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                              <Card variant="outlined">
                                <CardContent>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Entity ID
                                      </Typography>
                                      <Typography variant="body2" sx={{ mb: 1 }}>
                                        {log.entity_id || 'N/A'}
                                      </Typography>

                                      <Typography variant="subtitle2" color="text.secondary">
                                        User ID
                                      </Typography>
                                      <Typography variant="body2">
                                        {log.user_id || 'N/A'}
                                      </Typography>
                                    </Grid>

                                    <Grid item xs={12}>
                                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Details
                                      </Typography>
                                      <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                          p: 1, 
                                          bgcolor: 'grey.50',
                                          maxHeight: 200,
                                          overflow: 'auto'
                                        }}
                                      >
                                        <pre style={{ 
                                          margin: 0, 
                                          fontSize: '0.75rem',
                                          fontFamily: 'monospace',
                                          whiteSpace: 'pre-wrap',
                                          wordBreak: 'break-word'
                                        }}>
                                          {JSON.stringify(parseDetails(log.details), null, 2)}
                                        </pre>
                                      </Paper>
                                    </Grid>
                                  </Grid>
                                </CardContent>
                              </Card>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredLogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
}
