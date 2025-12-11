const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/database');
const { logAudit, getIp } = require('../utils/auditLogger');

// Generate JWT token
const generateToken = (userId, name, email, role, businessUnit) => {
  return jwt.sign(
    { userId, name, email, role, businessUnit },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Name or email and password are required' });
    }

    // Find user in database (DB column renamed to `name`)
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE name = ? OR email = ?',
      [username, username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // DEBUG: Log the user object from database
    console.log('=== USER FROM DATABASE ===');
    console.log('Full user object:', user);
    console.log('user.business_unit value:', user.business_unit);
    console.log('Type of business_unit:', typeof user.business_unit);

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token (include `name` in payload)
    const token = generateToken(user.id, user.name || user.username, user.email, user.role, user.business_unit);

    // Fire-and-forget audit log (do not await to keep login snappy)
    logAudit({
      entityType: 'auth',
      entityId: String(user.id),
      entityName: user.name || user.username,
      action: 'login',
      userId: user.id,
      userName: user.name || user.username,
      ip: getIp(req),
      details: { method: 'password', userAgent: req.headers['user-agent'] || null }
    });

    // Return user data (excluding password)
    const response = {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        // Normalize `name` for clients
        name: user.name || user.username,
        username: user.username || user.name,
        email: user.email,
        role: user.role,
        businessUnit: user.business_unit
      }
    };
    
    console.log('=== LOGIN RESPONSE DEBUG ===');
    console.log('User from DB:', { id: user.id, name: user.name, role: user.role, business_unit: user.business_unit });
    console.log('Response user object:', response.user);
    
    res.json(response);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Register new user (admin only)
const register = async (req, res) => {
  try {
    const { username, email, password, role, businessUnit } = req.body;

    // Validate input
    if (!username || !email || !password || !businessUnit) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate business unit
    if (!['NBFI', 'EPC'].includes(businessUnit)) {
      return res.status(400).json({ message: 'Invalid business unit. Must be NBFI or EPC' });
    }

    // Check if user already exists
    const pool = getPool();
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE name = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role, business_unit) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'employee', businessUnit]
    );

    // Fire-and-forget audit log
    logAudit({
      entityType: 'user',
      entityId: String(result.insertId),
      entityName: username,
      action: 'create',
      userId: req.userId || null,
      userName: req.name || req.username || null,
      ip: getIp(req),
      details: { email, role: role || 'employee', businessUnit }
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT id, name, email, role, business_unit, created_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    
    // Convert business_unit to businessUnit for consistency
    res.json({ 
      user: {
        id: user.id,
        name: user.name || user.username,
        username: user.username || user.name,
        email: user.email,
        role: user.role,
        businessUnit: user.business_unit,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify token
const verifyToken = async (req, res) => {
  try {
    res.json({ 
      message: 'Token is valid',
      user: {
        userId: req.userId,
        name: req.name || req.username,
        username: req.username || req.name,
        role: req.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  verifyToken
};