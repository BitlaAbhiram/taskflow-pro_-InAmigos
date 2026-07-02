// backend/models/Project.js
// ──────────────────────────────────────────────────────────
// Project schema: a workspace that contains tasks and has a
// team of members. Owner is the creator/admin of the project.
// ──────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'editor', 'viewer'],
          default: 'editor',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'on-hold', 'completed', 'archived'],
      default: 'active',
    },
    color: {
      type: String,
      default: '#6366f1', // used for UI tagging (indigo default)
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ─── Indexes ─────────────────────────────────────────────
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

// ─── Virtual: task count (populated on demand via controller) ─
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true,
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
