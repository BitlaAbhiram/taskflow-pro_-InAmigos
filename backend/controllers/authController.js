// backend/controllers/authController.js
// ──────────────────────────────────────────────────────────
// Handles registration, login, logout, and the "get current
// user" endpoint used to rehydrate auth state on app load.
// ──────────────────────────────────────────────────────────

const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409);
    throw new Error('An account with that email already exists');
  }

  // First registered user in the system becomes admin automatically.
  // This is a common bootstrap pattern for new SaaS instances.
  const userCount = await User.countDocuments();
  const role = userCount === 0 ? 'admin' : 'user';

  const user = await User.create({ name, email, password, role });

  if (!user) {
    res.status(400);
    throw new Error('Invalid user data');
  }

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      jobTitle: user.jobTitle,
    },
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password since schema excludes it by default
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact an admin.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      jobTitle: user.jobTitle,
    },
  });
});

// @desc    Logout user (client discards token; stateless JWT)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  // With stateless JWTs there's nothing to invalidate server-side
  // unless you maintain a token blocklist. We respond success so
  // the client can clear local storage / cookies.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

module.exports = { registerUser, loginUser, logoutUser, getMe };
