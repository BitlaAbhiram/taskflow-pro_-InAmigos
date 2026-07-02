// backend/models/Task.js
// ──────────────────────────────────────────────────────────
// Task schema: the core unit of work. Belongs to a project,
// can be assigned to a user, and tracks status/priority/due date.
// ──────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

// ─── Indexes for common queries ──────────────────────────
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ dueDate: 1 });

// ─── Auto-set completedAt when status flips to done ──────
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = undefined;
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
