// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
  registerValidation,
  loginValidation,
  validateRequest,
} = require('../middleware/validateMiddleware');

// POST /api/auth/register
router.post('/register', registerValidation, validateRequest, registerUser);

// POST /api/auth/login
router.post('/login', loginValidation, validateRequest, loginUser);

// POST /api/auth/logout
router.post('/logout', protect, logoutUser);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
