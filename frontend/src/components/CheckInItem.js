import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Chip,
  Alert,
  Autocomplete
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  CheckCircle as CheckInIcon,
  Assignment,
  Laptop,
  Monitor,
  Phone,
  Chair,
  Keyboard
} from '@mui/icons-material';
import Dashboard from './Dashboard';

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(139, 92, 246, 0.2)',
  borderRadius: '24px',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
}));

const ModernButton = styled(Button)(({ theme }) => ({
  borderRadius: '16px',
  padding: '16px 32px',
  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
  color: 'white',
  fontWeight: '700',
  fontSize: '16px',
  textTransform: 'none',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.05)',
    boxShadow: '0 20px 40px rgba(139, 92, 246, 0.6)',
  },
}));

const categoryIcons = {
  'Laptops': Laptop,
  'Monitors': Monitor,
  'Phones': Phone,
  'Furniture': Chair,
  'Peripherals': Keyboard,
};

const assignedItems = [
  {
    id: 1,
    name: 'MacBook Pro 14"',
    assignedTo: 'John Doe',
    category: 'Laptops',
    serialNumber: 'MBA001',
    assignedDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Dell Monitor 27"',
    assignedTo: 'Jane Smith',
    category: 'Monitors',
    serialNumber: 'DEL001',
    assignedDate: '2024-01-20',
  },
  {
    id: 3,
    name: 'iPhone 15 Pro',
    assignedTo: 'Mike Johnson',
    category: 'Phones',
    serialNumber: 'IPH001',
    assignedDate: '2024-02-01',
  },
];

const CheckInItem = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const filteredItems = assignedItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckIn = () => {
    if (selectedItem) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedItem(null);
        setNotes('');
        setSearchTerm('');
      }, 3000);
    }
  };

  const getCategoryIcon = (category) => {
    const IconComponent = categoryIcons[category] || Laptop;
    return <IconComponent />;
  };

  return (
    <Dashboard>
      <Box sx={{ 
        position: 'relative', 
        zIndex: 1,
        maxWidth: '1000px',
        mx: 'auto',
        width: '100%'
      }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <CheckInIcon sx={{ fontSize: 64, color: '#8b5cf6', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: '700', color: 'white', mb: 1 }}>
            Check In Item
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Return assigned items to inventory
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
            Item "{selectedItem?.name}" has been successfully checked in!
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <GlassCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: '600' }}>
                  Select Item to Return
                </Typography>
                
                <Autocomplete
                  options={filteredItems}
                  getOptionLabel={(option) => `${option.name} - ${option.assignedTo}`}
                  value={selectedItem}
                  onChange={(event, newValue) => setSelectedItem(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search assigned items..."
                      fullWidth
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                        }
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} sx={{ p: 2 }}>
                      <Avatar sx={{ 
                        mr: 2, 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                      }}>
                        {getCategoryIcon(option.category)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" fontWeight="600">
                          {option.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Assigned to: {option.assignedTo}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Add notes about the return..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                    }
                  }}
                />

                <ModernButton
                  fullWidth
                  startIcon={<CheckInIcon />}
                  onClick={handleCheckIn}
                  disabled={!selectedItem}
                >
                  Check In Item
                </ModernButton>
              </CardContent>
            </GlassCard>
          </Grid>

          <Grid item xs={12} md={6}>
            {selectedItem ? (
              <GlassCard>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: '600' }}>
                    Item Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      mr: 2, 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                      width: 56,
                      height: 56
                    }}>
                      {getCategoryIcon(selectedItem.category)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: '600' }}>
                        {selectedItem.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {selectedItem.category}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ space: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                        Assigned To
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: '600' }}>
                        {selectedItem.assignedTo}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                        Serial Number
                      </Typography>
                      <Chip 
                        label={selectedItem.serialNumber}
                        sx={{ 
                          background: 'rgba(139, 92, 246, 0.2)',
                          color: '#8b5cf6',
                          fontFamily: 'monospace'
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                        Assigned Date
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'white' }}>
                        {selectedItem.assignedDate}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </GlassCard>
            ) : (
              <GlassCard>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Assignment sx={{ fontSize: 64, color: 'rgba(139, 92, 246, 0.5)', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                    No Item Selected
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Search and select an assigned item to view details
                  </Typography>
                </CardContent>
              </GlassCard>
            )}
          </Grid>
        </Grid>
      </Box>
    </Dashboard>
  );
};

export default CheckInItem;