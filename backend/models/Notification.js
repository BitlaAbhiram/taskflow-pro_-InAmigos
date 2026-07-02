// backend/models/Notification.js
// ──────────────────────────────────────────────────────────
// Notification schema: in-app alerts for task updates, due
// date reminders, assignments, and team activity.
// ──────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'task-assigned',
        'task-updated',
        'task-completed',
        'due-date-reminder',
        'comment-added',
        'project-invite',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
