// backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getProductivityChart,
  getProjectStats,
  getAdminReport,
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/analytics/dashboard
router.get('/dashboard', protect, getDashboardStats);

// GET /api/analytics/productivity?days=30
router.get('/productivity', protect, getProductivityChart);

// GET /api/analytics/projects
router.get('/projects', protect, getProjectStats);

// GET /api/analytics/admin
router.get('/admin', protect, admin, getAdminReport);

module.exports = router;
