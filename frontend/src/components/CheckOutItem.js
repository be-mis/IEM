import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Output as CheckOutIcon,
  Search as SearchIcon,
  Assignment as AssignIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Dashboard from './Dashboard';

// Mock available items
const availableItems = [
  { id: 1, name: 'MacBook Pro 14"', brand: 'Apple', serialNumber: 'MBA001', category: 'Laptops' },
  { id: 4, name: 'Office Chair', brand: 'Herman Miller', serialNumber: 'HM001', category: 'Furniture' },
];

const steps = ['Select Item', 'Employee Details', 'Confirm Assignment'];

const CheckOutItem = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    department: '',
    notes: '',
    dueDate: '',
  });
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Complete the assignment
      setCompleted(true);
      console.log('Assigning item:', { selectedItem, employeeData });
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setSelectedItem(null);
    setEmployeeData({
      name: '',
      email: '',
      department: '',
      notes: '',
      dueDate: '',
    });
    setCompleted(false);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return selectedItem !== null;
      case 1:
        return employeeData.name.trim() !== '';
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Item to Assign
              </Typography>
              <Autocomplete
                options={availableItems}
                getOptionLabel={(option) => `${option.name} (${option.serialNumber})`}
                value={selectedItem}
                onChange={(event, newValue) => setSelectedItem(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for available items"
                    placeholder="Type item name or serial number..."
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.brand} - {option.serialNumber} - {option.category}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
              
              {selectedItem && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="info">
                    Selected: <strong>{selectedItem.name}</strong> ({selectedItem.serialNumber})
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Assignment Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Employee Name"
                    required
                    value={employeeData.name}
                    onChange={(e) => setEmployeeData({...employeeData, name: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={employeeData.email}
                    onChange={(e) => setEmployeeData({...employeeData, email: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    value={employeeData.department}
                    onChange={(e) => setEmployeeData({...employeeData, department: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Expected Return Date"
                    type="date"
                    value={employeeData.dueDate}
                    onChange={(e) => setEmployeeData({...employeeData, dueDate: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Assignment Notes"
                    multiline
                    rows={3}
                    value={employeeData.notes}
                    onChange={(e) => setEmployeeData({...employeeData, notes: e.target.value})}
                    placeholder="Any special instructions or notes..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Confirm Assignment
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Field</TableCell>
                      <TableCell>Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Item</strong></TableCell>
                      <TableCell>{selectedItem?.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Serial Number</strong></TableCell>
                      <TableCell>{selectedItem?.serialNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Employee</strong></TableCell>
                      <TableCell>{employeeData.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell>{employeeData.email || 'Not provided'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Department</strong></TableCell>
                      <TableCell>{employeeData.department || 'Not specified'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Expected Return</strong></TableCell>
                      <TableCell>{employeeData.dueDate || 'Not specified'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Notes</strong></TableCell>
                      <TableCell>{employeeData.notes || 'None'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  const CheckOutContent = () => (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <CheckOutIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Check Out Item</Typography>
      </Box>

      {completed ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Assignment Completed!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {selectedItem?.name} has been successfully assigned to {employeeData.name}.
            </Typography>
            <Button variant="contained" onClick={handleReset}>
              Assign Another Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              {activeStep === steps.length - 1 ? 'Complete Assignment' : 'Next'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );

  return <Dashboard>{<CheckOutContent />}</Dashboard>;
};

export default CheckOutItem;