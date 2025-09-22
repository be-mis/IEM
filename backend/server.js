// backend/server.js - Network accessible version
const express = require('express');
const cors = require('cors');
const { connectDatabase, initializeDatabase } = require('./config/database');
const inventoryRoutes = require('./routes/inventory');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Middleware - Updated CORS to allow your network IP
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://192.168.0.138:3000', // Your network IP
    'http://192.168.0.*:3000'    // Allow any device on your subnet
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    host: req.get('host')
  });
});

// API Routes
app.use('/api/inventory', inventoryRoutes);
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Inventory Management System API',
    version: '1.0.0',
    server_ip: '192.168.0.138',
    endpoints: {
      health: '/health',
      inventory: '/api/inventory/*',
      auth: '/api/auth/*'
    }
  });
});

// ADD THIS: Stats endpoint for dashboard
app.get('/api/inventory/stats', async (req, res) => {
  try {
    const pool = require('./config/database').getPool();
    
    // Get total count
    const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM inventory_items');
    const totalItems = totalResult[0].total;
    
    // Get available count
    const [availableResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM inventory_items WHERE status = ? OR status IS NULL', 
      ['AVAILABLE']
    );
    const available = availableResult[0].count;
    
    // Get assigned count
    const [assignedResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM inventory_items WHERE status = ?', 
      ['ASSIGNED']
    );
    const assigned = assignedResult[0].count;
    
    // Get maintenance count
    const [maintenanceResult] = await pool.execute(
      'SELECT COUNT(*) as count FROM inventory_items WHERE status = ?', 
      ['MAINTENANCE']
    );
    const maintenance = maintenanceResult[0].count;
    
    res.json({
      totalItems,
      available,
      assigned,
      maintenance
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl} from ${req.ip}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: [
      'GET /health',
      'GET /api/inventory/items',
      'GET /api/inventory/stats',
      'POST /api/inventory/items',
      'PUT /api/inventory/items/:id',
      'DELETE /api/inventory/items/:id'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});


// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');
    
    // Initialize database (create tables, default data)
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    // Start the server on all network interfaces
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`🌐 Network Access: http://192.168.0.138:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Local API URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Network API URL: http://192.168.0.138:${PORT}/api`);
      console.log(`🏥 Health Check: http://192.168.0.138:${PORT}/health`);
      console.log(`📱 Officemates can access at: http://192.168.0.138:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;