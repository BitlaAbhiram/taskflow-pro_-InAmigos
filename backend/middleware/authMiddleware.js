// backend/middleware/authMiddleware.js
// ──────────────────────────────────────────────────────────
// Verifies JWT from the Authorization header, attaches the
// authenticated user to req.user, and protects private routes.
// ──────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ─── protect: require a valid JWT ───────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (without password) to request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User belonging to this token no longer exists');
      }

      if (!req.user.isActive) {
        res.status(403);
        throw new Error('This account has been deactivated');
      }

      return next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed or expired');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// ─── admin: require role === 'admin' ────────────────────
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Access denied — admin privileges required');
};

module.exports = { protect, admin };
