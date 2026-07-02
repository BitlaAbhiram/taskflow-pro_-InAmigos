// backend/controllers/taskController.js
// ──────────────────────────────────────────────────────────
// Task CRUD, status transitions, assignment, and comments.
// Every task is scoped to a project; access is gated by
// project membership.
// ──────────────────────────────────────────────────────────

const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');
const createNotification = require('../utils/createNotification');

const isProjectMember = (project, userId) =>
  project.owner.equals(userId) ||
  project.members.some((m) => m.user.equals(userId));

// @desc    Create a task within a project
// @route   POST /api/tasks
// @access  Private (project members only)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, assignedTo, status, priority, dueDate, tags } =
    req.body;

  const projectDoc = await Project.findById(project);
  if (!projectDoc) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (!isProjectMember(projectDoc, req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not a member of this project');
  }

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    status,
    priority,
    dueDate,
    tags,
  });

  if (assignedTo && String(assignedTo) !== String(req.user._id)) {
    await createNotification({
      recipient: assignedTo,
      type: 'task-assigned',
      message: `${req.user.name} assigned you a task: "${task.title}"`,
      relatedTask: task._id,
      relatedProject: project,
    });
  }

  const populated = await Task.findById(task._id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name color');

  res.status(201).json({ success: true, task: populated });
});

// @desc    Get tasks (filterable by project, status, assignee)
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const { project, status, assignedTo, priority, search } = req.query;

  // Build query: limit to projects the user belongs to, unless admin
  let accessibleProjectIds = null;
  if (req.user.role !== 'admin') {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    }).select('_id');
    accessibleProjectIds = projects.map((p) => p._id);
  }

  const query = {};
  if (accessibleProjectIds) query.project = { $in: accessibleProjectIds };
  if (project) query.project = project; // narrow further if specified
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;
  if (priority) query.priority = priority;
  if (search) query.title = { $regex: search, $options: 'i' };

  const tasks = await Task.find(query)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name color')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: tasks.length, tasks });
});

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name color members owner')
    .populate('comments.user', 'name avatar');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (
    !isProjectMember(task.project, req.user._id) &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You do not have access to this task');
  }

  res.status(200).json({ success: true, task });
});

// @desc    Update task (title, description, priority, due date, assignment)
// @route   PUT /api/tasks/:id
// @access  Private (project members)
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (
    !isProjectMember(task.project, req.user._id) &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You do not have access to this task');
  }

  const previousAssignee = task.assignedTo ? String(task.assignedTo) : null;

  const fields = ['title', 'description', 'priority', 'dueDate', 'tags', 'assignedTo'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) task[field] = req.body[field];
  });

  const updated = await task.save();

  // Notify newly assigned user
  const newAssignee = updated.assignedTo ? String(updated.assignedTo) : null;
  if (newAssignee && newAssignee !== previousAssignee && newAssignee !== String(req.user._id)) {
    await createNotification({
      recipient: newAssignee,
      type: 'task-assigned',
      message: `${req.user.name} assigned you a task: "${updated.title}"`,
      relatedTask: updated._id,
      relatedProject: task.project._id,
    });
  }

  const populated = await Task.findById(updated._id)
    .populate('assignedTo', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name color');

  res.status(200).json({ success: true, task: populated });
});

// @desc    Update only the task status (for drag-and-drop boards)
// @route   PATCH /api/tasks/:id/status
// @access  Private (project members)
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id).populate('project');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (
    !isProjectMember(task.project, req.user._id) &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You do not have access to this task');
  }

  task.status = status;
  const updated = await task.save();

  // Notify the task creator (if someone else moved it) that it changed
  if (
    task.createdBy &&
    String(task.createdBy) !== String(req.user._id) &&
    status === 'done'
  ) {
    await createNotification({
      recipient: task.createdBy,
      type: 'task-completed',
      message: `${req.user.name} marked "${task.title}" as done`,
      relatedTask: task._id,
      relatedProject: task.project._id,
    });
  }

  res.status(200).json({ success: true, task: updated });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (creator, project owner, or admin)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  const isCreator = String(task.createdBy) === String(req.user._id);
  const isProjectOwner = task.project.owner.equals(req.user._id);

  if (!isCreator && !isProjectOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You do not have permission to delete this task');
  }

  await task.deleteOne();
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

// @desc    Add a comment to a task
// @route   POST /api/tasks/:id/comments
// @access  Private (project members)
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const task = await Task.findById(req.params.id).populate('project');

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (
    !isProjectMember(task.project, req.user._id) &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error('You do not have access to this task');
  }

  task.comments.push({ user: req.user._id, text });
  await task.save();

  if (task.assignedTo && String(task.assignedTo) !== String(req.user._id)) {
    await createNotification({
      recipient: task.assignedTo,
      type: 'comment-added',
      message: `${req.user.name} commented on "${task.title}"`,
      relatedTask: task._id,
      relatedProject: task.project._id,
    });
  }

  const populated = await Task.findById(task._id).populate(
    'comments.user',
    'name avatar'
  );

  res.status(201).json({ success: true, comments: populated.comments });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addComment,
};
