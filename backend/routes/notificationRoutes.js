// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// GET    /api/notifications
router.get('/', protect, getNotifications);

// PATCH  /api/notifications/read-all
router.patch('/read-all', protect, markAllAsRead);

// PATCH  /api/notifications/:id/read
router.patch('/:id/read', protect, markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', protect, deleteNotification);

module.exports = router;
