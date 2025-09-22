import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Download,
  BarChart,
  TrendingUp,
  Inventory,
  Assignment,
  Analytics,
  PictureAsPdf,
  TableChart
} from '@mui/icons-material';
import Dashboard from './Dashboard';

// Styled components
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.2)',
  },
}));

const StatCard = styled(Card)(({ theme, gradient }) => ({
  background: gradient,
  color: 'white',
  borderRadius: '20px',
  border: 'none',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
  },
}));

const ModernButton = styled(Button)(({ theme, variant = 'primary' }) => ({
  borderRadius: '12px',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: '600',
  transition: 'all 0.3s ease',
  ...(variant === 'primary' && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    },
  }),
  ...(variant === 'secondary' && {
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#667eea',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    '&:hover': {
      background: 'rgba(102, 126, 234, 0.1)',
      transform: 'translateY(-2px)',
    },
  }),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '& .MuiTableHead-root': {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  },
  '& .MuiTableCell-head': {
    fontWeight: '600',
    color: '#4a5568',
    borderBottom: '2px solid rgba(102, 126, 234, 0.1)',
  },
  '& .MuiTableRow-root:hover': {
    background: 'rgba(102, 126, 234, 0.05)',
  },
}));

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('inventory');
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });
  const [stats, setStats] = useState({
    totalItems: 0,
    assignedItems: 0,
    availableItems: 0,
    maintenanceItems: 0
  });

  const sampleReportData = {
    inventory: [
      { id: 1, name: 'MacBook Pro 14"', category: 'Laptops', status: 'assigned', assignedTo: 'John Doe', value: '$2,499' },
      { id: 2, name: 'Dell Monitor 27"', category: 'Monitors', status: 'available', assignedTo: null, value: '$599' },
      { id: 3, name: 'iPhone 15 Pro', category: 'Phones', status: 'assigned', assignedTo: 'Jane Smith', value: '$999' },
      { id: 4, name: 'Office Chair', category: 'Furniture', status: 'available', assignedTo: null, value: '$1,395' },
    ],
    assignments: [
      { id: 1, item: 'MacBook Pro 14"', assignedTo: 'John Doe', date: '2024-01-15', status: 'active', department: 'IT' },
      { id: 2, item: 'iPhone 15 Pro', assignedTo: 'Jane Smith', date: '2024-01-20', status: 'active', department: 'Sales' },
      { id: 3, item: 'Wireless Keyboard', assignedTo: 'Mike Johnson', date: '2024-01-10', status: 'returned', department: 'Marketing' },
    ]
  };

  useEffect(() => {
    setStats({
      totalItems: 150,
      assignedItems: 89,
      availableItems: 45,
      maintenanceItems: 16
    });
    setReportData(sampleReportData);
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setReportData(sampleReportData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating report:', error);
      setLoading(false);
    }
  };

  const handleExportReport = (format) => {
    console.log(`Exporting report as ${format}`);
    alert(`Report exported as ${format.toUpperCase()}`);
  };

  const renderStatsCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: '700', mb: 1 }}>
                  {stats.totalItems}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Items
                </Typography>
              </Box>
              <Inventory sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </StatCard>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)">
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: '700', mb: 1 }}>
                  {stats.assignedItems}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Assigned
                </Typography>
              </Box>
              <Assignment sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </StatCard>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard gradient="linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)">
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: '700', mb: 1 }}>
                  {stats.availableItems}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Available
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </StatCard>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" sx={{ fontWeight: '700', mb: 1 }}>
                  {stats.maintenanceItems}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Maintenance
                </Typography>
              </Box>
              <BarChart sx={{ fontSize: 48, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </StatCard>
      </Grid>
    </Grid>
  );

  const renderReportFilters = () => (
    <GlassCard sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Analytics sx={{ mr: 2, color: '#667eea' }} />
          <Typography variant="h6" sx={{ fontWeight: '600', color: '#2d3748' }}>
            Report Filters
          </Typography>
        </Box>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
                sx={{
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                <MenuItem value="inventory">Inventory Report</MenuItem>
                <MenuItem value="assignments">Assignment Report</MenuItem>
                <MenuItem value="maintenance">Maintenance Report</MenuItem>
                <MenuItem value="usage">Usage Report</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ModernButton
              variant="primary"
              onClick={handleGenerateReport}
              disabled={loading}
              fullWidth
              sx={{ height: 56 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Report'}
            </ModernButton>
          </Grid>
        </Grid>
      </CardContent>
    </GlassCard>
  );

  const renderReportTable = () => {
    if (!reportData) return null;

    const data = reportType === 'inventory' ? reportData.inventory : reportData.assignments;
    
    return (
      <GlassCard>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: '600', color: '#2d3748' }}>
              {reportType === 'inventory' ? 'Inventory Report' : 'Assignment Report'}
            </Typography>
            <Box>
              <ModernButton
                variant="secondary"
                startIcon={<PictureAsPdf />}
                onClick={() => handleExportReport('pdf')}
                sx={{ mr: 1 }}
              >
                Export PDF
              </ModernButton>
              <ModernButton
                variant="secondary"
                startIcon={<TableChart />}
                onClick={() => handleExportReport('excel')}
              >
                Export Excel
              </ModernButton>
            </Box>
          </Box>
          
          <StyledTableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {reportType === 'inventory' ? (
                    <>
                      <TableCell>ID</TableCell>
                      <TableCell>Item Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Value</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>ID</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    {reportType === 'inventory' ? (
                      <>
                        <TableCell sx={{ fontWeight: '600' }}>{row.id}</TableCell>
                        <TableCell sx={{ fontWeight: '500' }}>{row.name}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              textAlign: 'center',
                              background: row.status === 'available' ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 
                                         row.status === 'assigned' ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' : 
                                         'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                              color: 'white'
                            }}
                          >
                            {row.status.toUpperCase()}
                          </Box>
                        </TableCell>
                        <TableCell>{row.assignedTo || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: '600', color: '#059669' }}>{row.value}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={{ fontWeight: '600' }}>{row.id}</TableCell>
                        <TableCell sx={{ fontWeight: '500' }}>{row.item}</TableCell>
                        <TableCell>{row.assignedTo}</TableCell>
                        <TableCell>
                          <Box sx={{ 
                            px: 2, 
                            py: 0.5, 
                            background: 'rgba(102, 126, 234, 0.1)', 
                            borderRadius: '6px', 
                            color: '#667eea',
                            fontWeight: '500',
                            display: 'inline-block'
                          }}>
                            {row.department}
                          </Box>
                        </TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              textAlign: 'center',
                              background: row.status === 'active' ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                              color: 'white'
                            }}
                          >
                            {row.status.toUpperCase()}
                          </Box>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>
        </CardContent>
      </GlassCard>
    );
  };

  return (
    <Dashboard>
      <Box sx={{ 
        position: 'relative', 
        zIndex: 1,
        maxWidth: '1400px',
        mx: 'auto',
        width: '100%'
      }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: '700', color: 'white', mb: 1 }}>
            Reports & Analytics
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Generate comprehensive reports and analyze your inventory data
          </Typography>
        </Box>
        
        {renderStatsCards()}
        {renderReportFilters()}
        {renderReportTable()}
      </Box>
    </Dashboard>
  );
};

export default Reports;