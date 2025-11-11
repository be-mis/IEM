// backend/server.js - Network accessible version
const express = require('express');
const cors = require('cors');
const { connectDatabase, initializeDatabase } = require('./config/database');
const { verifyEmailConfig } = require('./utils/emailService');
const inventoryRoutes = require('./routes/inventory');
const authRoutes = require('./routes/auth');
const filtersRoutes = require('./routes/filters');
const dashboardRoutes = require('./routes/dashboard');
const reportsRoutes = require('./routes/reports');
const auditRoutes = require('./routes/audit');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

// Middleware - Updated CORS to allow your network IP
const allowed = new RegExp(/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):3020$/);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.test(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  //console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
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
app.use('/api/filters', filtersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/audit', auditRoutes);


// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Inventory Management System API',
    version: '1.0.0',
    server_ip: '192.168.0.138',
    endpoints: {
      health: '/health',
      inventory: '/api/inventory/*',
      auth: '/api/auth/*',
      filters: '/api/filters/*'
    }
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  //console.log(`❌ Route not found: ${req.method} ${req.originalUrl} from ${req.ip}`);
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
      'DELETE /api/inventory/items/:id',
      'GET /api/filters/categories',     
      'GET /api/filters/chains',         
      'GET /api/filters/store-classes',
      'GET /api/filters/items',        
      'GET /api/filters/branches'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  //console.error('❌ Server Error:', err);
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
    //console.log('✅ Database connected successfully');
    
    // Initialize database (create tables, default data)
    await initializeDatabase();
    //console.log('✅ Database initialized successfully');
    
    // Check email configuration
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log('📧 Verifying email configuration...');
      await verifyEmailConfig();
    } else {
      console.log('⚠️  Email not configured - Password reset emails will not be sent');
      console.log('   To enable email: Set EMAIL_USER and EMAIL_PASSWORD in .env file');
    }
    
    // Start the server on all network interfaces
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✅ Backend is ready to accept requests`);
    });
  } catch (error) {
    //console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;