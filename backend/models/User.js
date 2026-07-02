// backend/models/User.js
// ──────────────────────────────────────────────────────────
// User schema: handles auth, profile, and role-based access
// (admin/user). Passwords are hashed via bcrypt pre-save hook.
// ──────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '', // URL or initials-based placeholder handled client-side
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: 80,
    },
    isActive: {
      type: Boolean,
      default: true, // admins can deactivate a user instead of deleting
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

// ─── Indexes ─────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });

// ─── Hash password before saving ────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare plaintext password to hash ─
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Strip sensitive fields when converting to JSON ─────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
