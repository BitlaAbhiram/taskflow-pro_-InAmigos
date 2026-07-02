// backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { taskValidation, validateRequest } = require('../middleware/validateMiddleware');

// POST /api/tasks        — create task
router.post('/', protect, taskValidation, validateRequest, createTask);

// GET  /api/tasks        — list tasks (filterable)
router.get('/', protect, getTasks);

// GET  /api/tasks/:id    — single task
router.get('/:id', protect, getTaskById);

// PUT  /api/tasks/:id    — full update
router.put('/:id', protect, updateTask);

// PATCH /api/tasks/:id/status — status-only update (Kanban drag-drop)
router.patch('/:id/status', protect, updateTaskStatus);

// DELETE /api/tasks/:id  — delete task
router.delete('/:id', protect, deleteTask);

// POST /api/tasks/:id/comments — add comment
router.post('/:id/comments', protect, addComment);

module.exports = router;
