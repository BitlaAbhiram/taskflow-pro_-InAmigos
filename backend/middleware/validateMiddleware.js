// backend/middleware/validateMiddleware.js
// ──────────────────────────────────────────────────────────
// Reusable validator chains (express-validator) + a handler
// that collects validation errors into a consistent response.
// ──────────────────────────────────────────────────────────

const { body, validationResult } = require('express-validator');

// ─── Run after any validator chain to short-circuit on error ─
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    throw new Error(message);
  }
  next();
};

// ─── Auth validators ─────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

// ─── Task validators ──────────────────────────────────────
const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('project').notEmpty().withMessage('Project ID is required'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'done'])
    .withMessage('Invalid status value'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority value'),
];

// ─── Project validators ───────────────────────────────────
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
];

module.exports = {
  validateRequest,
  registerValidation,
  loginValidation,
  changePasswordValidation,
  taskValidation,
  projectValidation,
};
