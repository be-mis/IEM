// backend/routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getPool } = require('../config/database');
const { logAudit, getIp } = require('../utils/auditLogger');
const { sendPasswordResetEmail } = require('../utils/emailService');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
      [username]
    );
    
    if (users.length === 0) {
      // Log failed login attempt - user not found
      try {
        await logAudit({
          entityType: 'auth',
          entityId: null,
          action: 'login_failed',
          entityName: username,
          userId: null,
          userName: username,
          userEmail: req.user?.email || req.email || user?.email || null,
          ip: getIp(req),
          details: { success: false, reason: 'user_not_found' }
        });
      } catch (auditError) {
        console.error('Error logging failed login audit:', auditError);
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    console.log('Login attempt for user:', username, '| Stored hash length:', user.password?.length);
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', validPassword);
    
    if (!validPassword) {
      // Log failed login attempt - invalid password
      try {
        await logAudit({
          entityType: 'auth',
          entityId: user.id,
          action: 'login_failed',
          entityName: username,
          userId: user.id,
          userName: username,
        userEmail: req.user?.email || req.email || user?.email || null,
          ip: getIp(req),
          details: { success: false, reason: 'invalid_password' }
        });
      } catch (auditError) {
        console.error('Error logging failed login audit:', auditError);
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email,
        role: user.role,
        businessUnit: user.business_unit
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    // Log successful login
    try {
      await logAudit({
        entityType: 'auth',
        entityId: user.id,
        action: 'login',
        entityName: user.username,
        userId: user.id,
        userName: user.username,
        userEmail: user.email,
        ip: getIp(req),
        details: { 
          success: true, 
          role: user.role,
          email: user.email 
        }
      });
    } catch (auditError) {
      console.error('Error logging successful login audit:', auditError);
    }
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        businessUnit: user.business_unit
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// POST /api/auth/register (optional - for creating new users)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    const pool = getPool();
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(`
      INSERT INTO users (username, email, password, role, is_active)
      VALUES (?, ?, ?, ?, TRUE)
    `, [username, email, hashedPassword, role || 'employee']);
    
    // Log user registration
    try {
      await logAudit({
        entityType: 'auth',
        entityId: result.insertId,
        action: 'register',
        entityName: username,
        userId: result.insertId,
        userName: username,
        userEmail: req.user?.email || req.email || user?.email || null,
        ip: getIp(req),
        details: { 
          email,
          role: role || 'employee'
        }
      });
    } catch (auditError) {
      console.error('Error logging registration audit:', auditError);
    }
    
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user info' });
  }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const pool = getPool();
    
    // Check if user exists
    const [users] = await pool.execute(
      'SELECT id, username, email FROM users WHERE email = ?',
      [email]
    );
    
    // Always return success message to prevent email enumeration
    if (users.length === 0) {
      return res.json({ message: 'If the email exists, a password reset link has been sent' });
    }
    
    const user = users[0];
    
    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now
    
    // Store reset token in database
    await pool.execute(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, resetTokenExpires, user.id]
    );
    
    // Log forgot password request
    try {
      await logAudit({
        entityType: 'user',
        entityId: user.id,
        action: 'forgot_password',
        entityName: user.username,
        userId: user.id,
        userName: user.username,
        userEmail: req.user?.email || req.email || user?.email || null,
        ip: getIp(req),
        details: { email: user.email }
      });
    } catch (auditError) {
      console.error('Error logging forgot password audit:', auditError);
    }
    
    // Send password reset email
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isEmailConfigured = process.env.EMAIL_SERVICE && (
      process.env.EMAIL_USER || 
      process.env.SMTP_USER || 
      process.env.SENDGRID_API_KEY
    );
    
    if (isEmailConfigured) {
      try {
        await sendPasswordResetEmail(user.email, user.username, resetToken);
        console.log(`✅ Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Continue anyway - token is still stored in database
      }
    } else {
      console.log('⚠️ Email not configured. Password reset token generated but not sent.');
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
    }
    
    res.json({ 
      message: 'If the email exists, a password reset link has been sent',
      // Only include these in development mode when email is not configured
      ...(isDevelopment && !isEmailConfigured && {
        resetToken: resetToken,
        resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    
    const pool = getPool();
    
    // Find user with valid reset token
    const [users] = await pool.execute(
      'SELECT id, username, email FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    const user = users[0];
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear reset token
    await pool.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );
    
    // Log password reset
    try {
      await logAudit({
        entityType: 'user',
        entityId: user.id,
        action: 'reset_password',
        entityName: user.username,
        userId: user.id,
        userName: user.username,
        userEmail: req.user?.email || req.email || user?.email || null,
        ip: getIp(req),
        details: { email: user.email }
      });
    } catch (auditError) {
      console.error('Error logging password reset audit:', auditError);
    }
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// Middleware to verify admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET /api/auth/users - Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.execute(
      'SELECT id, username, email, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// POST /api/auth/users - Create new user (admin only)
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role, is_active } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    const pool = getPool();
    
    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'employee', is_active !== false]
    );
    
    // Log user creation
    try {
      await logAudit({
        entityType: 'user',
        entityId: result.insertId,
        action: 'create',
        entityName: username,
        userId: req.user.userId,
        userName: req.user.username,
        userEmail: req.user?.email || req.email || user?.email || null,
        ip: getIp(req),
        details: { email, role: role || 'employee', createdBy: req.user.username }
      });
    } catch (auditError) {
      console.error('Error logging user creation audit:', auditError);
    }
    
    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// PUT /api/auth/users/:id - Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, is_active } = req.body;
    
    const pool = getPool();
    
    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT username FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const username = existingUsers[0].username;
    
    // Build update query
    const updates = [];
    const values = [];
    
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    
    if (password) {
      console.log('Updating password for user:', username);
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
      console.log('Password hashed successfully');
    }
    
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Log user update
    try {
      await logAudit({
        entityType: 'user',
        entityId: id,
        action: 'update',
        entityName: username,
        userId: req.user.userId,
        userName: req.user.username,
        userEmail: req.user?.email || req.email || user?.email || null,
        ip: getIp(req),
        details: { updatedFields: Object.keys(req.body), updatedBy: req.user.username }
      });
    } catch (auditError) {
      console.error('Error logging user update audit:', auditError);
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// DELETE /api/auth/users/:id - Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting own account
    if (parseInt(id) === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    const pool = getPool();
    
    // Get user info before deleting
    const [users] = await pool.execute(
      'SELECT username, email FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const username = users[0].username;
    
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    
    // Log user deletion
    try {
      await logAudit({
        entityType: 'user',
        entityId: id,
        action: 'delete',
        entityName: username,
        userId: req.user.userId,
        userName: req.user.username,
        userEmail: req.user?.email || req.email || user?.email || null,
        ip: getIp(req),
        details: { deletedBy: req.user.username, email: users[0].email }
      });
    } catch (auditError) {
      console.error('Error logging user deletion audit:', auditError);
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;

