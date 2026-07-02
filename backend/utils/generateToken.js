// backend/utils/generateToken.js
// ──────────────────────────────────────────────────────────
// Signs a JWT containing the user's ID. Used on register/login.
// ──────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
