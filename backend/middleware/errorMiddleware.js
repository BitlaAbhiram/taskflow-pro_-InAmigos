// backend/middleware/errorMiddleware.js
// ──────────────────────────────────────────────────────────
// Centralized error handling: catches 404s and formats all
// thrown errors into a consistent JSON shape.
// ──────────────────────────────────────────────────────────

// Catch requests to undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Route not found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Final error handler — must be registered LAST in server.js
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // If status code wasn't explicitly set, default to 500
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found — invalid ID format';
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with that ${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
