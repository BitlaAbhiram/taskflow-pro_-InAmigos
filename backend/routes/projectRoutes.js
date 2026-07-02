// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { projectValidation, validateRequest } = require('../middleware/validateMiddleware');

// POST /api/projects       — create project
router.post('/', protect, projectValidation, validateRequest, createProject);

// GET  /api/projects       — get all projects for current user
router.get('/', protect, getProjects);

// GET  /api/projects/:id   — get single project
router.get('/:id', protect, getProjectById);

// PUT  /api/projects/:id   — update project
router.put('/:id', protect, updateProject);

// DELETE /api/projects/:id — delete project
router.delete('/:id', protect, deleteProject);

// POST   /api/projects/:id/members          — add member
router.post('/:id/members', protect, addMember);

// DELETE /api/projects/:id/members/:userId  — remove member
router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;
