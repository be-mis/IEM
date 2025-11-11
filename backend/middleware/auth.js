const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    req.email = decoded.email;
    req.role = decoded.role;
    req.businessUnit = decoded.businessUnit;
    // Also set req.user for easier access
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
      businessUnit: decoded.businessUnit
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// Check if user is admin or manager
const requireManagerOrAdmin = (req, res, next) => {
  if (req.role !== 'admin' && req.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied. Manager or Admin role required.' });
  }
  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireManagerOrAdmin
};