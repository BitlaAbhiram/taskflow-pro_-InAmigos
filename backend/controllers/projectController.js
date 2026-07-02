// backend/controllers/projectController.js
// ──────────────────────────────────────────────────────────
// Project CRUD + team member add/remove. Access control:
// any member can view; owner/editor can modify; only owner
// can delete the project or change membership roles.
// ──────────────────────────────────────────────────────────

const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const createNotification = require('../utils/createNotification');

// Helper: is the requesting user a member (any role) of this project?
const isMember = (project, userId) =>
  project.owner.equals(userId) ||
  project.members.some((m) => m.user.equals(userId));

// Helper: can the requesting user edit (owner or editor role)?
const canEdit = (project, userId) =>
  project.owner.equals(userId) ||
  project.members.some(
    (m) => m.user.equals(userId) && ['owner', 'editor'].includes(m.role)
  );

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { name, description, color, dueDate } = req.body;

  const project = await Project.create({
    name,
    description,
    color,
    dueDate,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'owner' }],
  });

  res.status(201).json({ success: true, project });
});

// @desc    Get all projects the current user belongs to
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
  })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

  // Attach live task counts per project
  const withCounts = await Promise.all(
    projects.map(async (p) => {
      const taskCount = await Task.countDocuments({ project: p._id });
      const completedCount = await Task.countDocuments({
        project: p._id,
        status: 'done',
      });
      return { ...p.toObject(), taskCount, completedCount };
    })
  );

  res.status(200).json({ success: true, count: withCounts.length, projects: withCounts });
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private (members only)
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar jobTitle');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!isMember(project, req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You do not have access to this project');
  }

  res.status(200).json({ success: true, project });
});

// @desc    Update project details
// @route   PUT /api/projects/:id
// @access  Private (owner/editor only)
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!canEdit(project, req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You do not have permission to edit this project');
  }

  const { name, description, status, color, dueDate } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  if (status !== undefined) project.status = status;
  if (color !== undefined) project.color = color;
  if (dueDate !== undefined) project.dueDate = dueDate;

  const updated = await project.save();
  res.status(200).json({ success: true, project: updated });
});

// @desc    Delete project (and its tasks)
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the project owner can delete this project');
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.status(200).json({ success: true, message: 'Project and its tasks deleted' });
});

// @desc    Add a team member to a project
// @route   POST /api/projects/:id/members
// @access  Private (owner/editor only)
const addMember = asyncHandler(async (req, res) => {
  const { userId, role = 'editor' } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!canEdit(project, req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You do not have permission to add members');
  }

  const alreadyMember = project.members.some((m) => m.user.equals(userId));
  if (alreadyMember) {
    res.status(409);
    throw new Error('User is already a member of this project');
  }

  project.members.push({ user: userId, role });
  await project.save();

  await createNotification({
    recipient: userId,
    type: 'project-invite',
    message: `You've been added to the project "${project.name}"`,
    relatedProject: project._id,
  });

  const updated = await Project.findById(project._id).populate(
    'members.user',
    'name email avatar'
  );

  res.status(200).json({ success: true, project: updated });
});

// @desc    Remove a team member from a project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (owner only)
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!project.owner.equals(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the project owner can remove members');
  }

  if (project.owner.equals(req.params.userId)) {
    res.status(400);
    throw new Error('Cannot remove the project owner');
  }

  project.members = project.members.filter(
    (m) => !m.user.equals(req.params.userId)
  );
  await project.save();

  res.status(200).json({ success: true, message: 'Member removed' });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
