// backend/controllers/userController.js
// ──────────────────────────────────────────────────────────
// Profile management (self) + admin user management (all users).
// ──────────────────────────────────────────────────────────

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Update own profile (name, jobTitle, avatar)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name ?? user.name;
  user.jobTitle = req.body.jobTitle ?? user.jobTitle;
  user.avatar = req.body.avatar ?? user.avatar;

  // Email changes should be rare; require uniqueness check if changed
  if (req.body.email && req.body.email !== user.email) {
    const emailTaken = await User.findOne({ email: req.body.email });
    if (emailTaken) {
      res.status(409);
      throw new Error('That email is already in use');
    }
    user.email = req.body.email;
  }

  const updated = await user.save();

  res.status(200).json({ success: true, user: updated });
});

// @desc    Change own password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword; // pre-save hook will hash it
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// @desc    Get all team members (lightweight list for assignment dropdowns)
// @route   GET /api/users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isActive: true }).select(
    'name email avatar jobTitle role'
  );
  res.status(200).json({ success: true, count: users.length, users });
});

// ─── ADMIN-ONLY ENDPOINTS ─────────────────────────────────

// @desc    Get all users (full detail, includes inactive)
// @route   GET /api/users/admin/all
// @access  Private/Admin
const adminGetAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: users.length, users });
});

// @desc    Update any user's role or active status
// @route   PUT /api/users/admin/:id
// @access  Private/Admin
const adminUpdateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (req.body.role) user.role = req.body.role;
  if (typeof req.body.isActive === 'boolean') user.isActive = req.body.isActive;
  if (req.body.name) user.name = req.body.name;

  const updated = await user.save();
  res.status(200).json({ success: true, user: updated });
});

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/admin/:id
// @access  Private/Admin
const adminDeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.equals(req.user._id)) {
    res.status(400);
    throw new Error('You cannot delete your own admin account');
  }

  // Unassign their tasks rather than cascade-deleting work history
  await Task.updateMany({ assignedTo: user._id }, { $set: { assignedTo: null } });
  await user.deleteOne();

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

module.exports = {
  updateProfile,
  changePassword,
  getAllUsers,
  adminGetAllUsers,
  adminUpdateUser,
  adminDeleteUser,
};
