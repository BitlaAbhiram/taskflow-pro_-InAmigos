// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  updateProfile,
  changePassword,
  getAllUsers,
  adminGetAllUsers,
  adminUpdateUser,
  adminDeleteUser,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  changePasswordValidation,
  validateRequest,
} = require('../middleware/validateMiddleware');

// GET  /api/users          — list active users (for assignment dropdowns)
router.get('/', protect, getAllUsers);

// PUT  /api/users/profile  — update own profile
router.put('/profile', protect, updateProfile);

// PUT  /api/users/change-password
router.put(
  '/change-password',
  protect,
  changePasswordValidation,
  validateRequest,
  changePassword
);

// ─── Admin-only routes ────────────────────────────────────
// GET    /api/users/admin/all
router.get('/admin/all', protect, admin, adminGetAllUsers);

// PUT    /api/users/admin/:id
router.put('/admin/:id', protect, admin, adminUpdateUser);

// DELETE /api/users/admin/:id
router.delete('/admin/:id', protect, admin, adminDeleteUser);

module.exports = router;
