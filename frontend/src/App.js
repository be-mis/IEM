import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';
import AddItem from './components/AddItem';
import ViewItems from './components/ViewItems';
import CheckOutItem from './components/CheckOutItem';
import CheckInItem from './components/CheckInItem';
import Reports from './components/Reports';
import './App.css';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/view-items" element={<ViewItems />} />
            <Route path="/check-out" element={<CheckOutItem />} />
            <Route path="/check-in" element={<CheckInItem />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;