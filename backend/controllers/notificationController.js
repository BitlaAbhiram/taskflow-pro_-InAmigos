// backend/controllers/notificationController.js
// ──────────────────────────────────────────────────────────
// Manage in-app notifications for the authenticated user.
// ──────────────────────────────────────────────────────────

const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate('relatedTask', 'title status')
    .populate('relatedProject', 'name color')
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({ success: true, notifications, unreadCount });
});

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ success: true, notification });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  );
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await notification.deleteOne();
  res.status(200).json({ success: true, message: 'Notification deleted' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
