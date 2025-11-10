import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import AddItem from './components/AddItem';
import ViewItems from './components/ViewItems';
import CheckOutItem from './components/CheckOutItem';
import CheckInItem from './components/CheckInItem';
import Reports from './components/Reports';
import AuditLogs from './components/AuditLogs';
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
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/add-item" 
                element={
                  <ProtectedRoute>
                    <AddItem />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/view-items" 
                element={
                  <ProtectedRoute>
                    <ViewItems />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/check-out" 
                element={
                  <ProtectedRoute>
                    <CheckOutItem />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/check-in" 
                element={
                  <ProtectedRoute>
                    <CheckInItem />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/audit-logs" 
                element={
                  <ProtectedRoute>
                    <AuditLogs />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
