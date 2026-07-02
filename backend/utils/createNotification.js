// backend/utils/createNotification.js
// ──────────────────────────────────────────────────────────
// Small helper to DRY up notification creation across
// controllers (task assignment, due dates, comments, etc).
// ──────────────────────────────────────────────────────────

const Notification = require('../models/Notification');

/**
 * Create a notification for a user.
 * @param {Object} params
 * @param {string} params.recipient - User ID to notify
 * @param {string} params.type - Notification type enum value
 * @param {string} params.message - Human-readable message
 * @param {string} [params.relatedTask] - Task ID reference
 * @param {string} [params.relatedProject] - Project ID reference
 */
const createNotification = async ({
  recipient,
  type,
  message,
  relatedTask,
  relatedProject,
}) => {
  try {
    // Don't notify yourself about your own action
    await Notification.create({
      recipient,
      type,
      message,
      relatedTask,
      relatedProject,
    });
  } catch (err) {
    // Notification failures should never break the main request
    console.error('Failed to create notification:', err.message);
  }
};

module.exports = createNotification;
