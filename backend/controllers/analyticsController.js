// backend/controllers/analyticsController.js
// ──────────────────────────────────────────────────────────
// Aggregated stats used by the Dashboard and Analytics pages.
// Returns task counts, project summaries, and time-series data
// for productivity charts.
// ──────────────────────────────────────────────────────────

const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// ─── Helper: projects accessible to the requesting user ──
const getAccessibleProjectIds = async (user) => {
  if (user.role === 'admin') {
    const all = await Project.find().select('_id');
    return all.map((p) => p._id);
  }
  const projects = await Project.find({
    $or: [{ owner: user._id }, { 'members.user': user._id }],
  }).select('_id');
  return projects.map((p) => p._id);
};

// @desc    Get dashboard summary stats for the current user
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const projectIds = await getAccessibleProjectIds(req.user);

  const [total, todo, inProgress, review, done, overdue] = await Promise.all([
    Task.countDocuments({ project: { $in: projectIds } }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'review' }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
    Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() },
    }),
  ]);

  const projectCount = projectIds.length;

  // Recent tasks (last 5)
  const recentTasks = await Task.find({ project: { $in: projectIds } })
    .populate('assignedTo', 'name avatar')
    .populate('project', 'name color')
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title status priority dueDate project assignedTo updatedAt');

  // My assigned tasks
  const myTasks = await Task.find({
    project: { $in: projectIds },
    assignedTo: req.user._id,
    status: { $ne: 'done' },
  })
    .populate('project', 'name color')
    .sort({ dueDate: 1 })
    .limit(5);

  res.status(200).json({
    success: true,
    stats: { total, todo, inProgress, review, done, overdue, projectCount },
    recentTasks,
    myTasks,
  });
});

// @desc    Productivity chart: tasks completed per day for last N days
// @route   GET /api/analytics/productivity?days=30
// @access  Private
const getProductivityChart = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 90);
  const projectIds = await getAccessibleProjectIds(req.user);

  const since = new Date();
  since.setDate(since.getDate() - days);

  // Aggregate tasks completed per day
  const completed = await Task.aggregate([
    {
      $match: {
        project: { $in: projectIds },
        status: 'done',
        completedAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Created per day
  const created = await Task.aggregate([
    {
      $match: {
        project: { $in: projectIds },
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({ success: true, completed, created, days });
});

// @desc    Project-level stats: task breakdown per project
// @route   GET /api/analytics/projects
// @access  Private
const getProjectStats = asyncHandler(async (req, res) => {
  const projectIds = await getAccessibleProjectIds(req.user);

  const breakdown = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: { project: '$project', status: '$status' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.project',
        statuses: {
          $push: { status: '$_id.status', count: '$count' },
        },
        total: { $sum: '$count' },
      },
    },
  ]);

  // Populate project names
  const projects = await Project.find({ _id: { $in: projectIds } }).select(
    'name color'
  );
  const projectMap = Object.fromEntries(projects.map((p) => [p._id.toString(), p]));

  const result = breakdown.map((b) => ({
    project: projectMap[b._id.toString()],
    statuses: b.statuses,
    total: b.total,
  }));

  res.status(200).json({ success: true, projectStats: result });
});

// @desc    Admin: platform-wide report
// @route   GET /api/analytics/admin
// @access  Private/Admin
const getAdminReport = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalProjects, totalTasks, completedTasks] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Project.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'done' }),
    ]);

  // Top 5 most active users by tasks created
  const topUsers = await Task.aggregate([
    { $group: { _id: '$createdBy', taskCount: { $sum: 1 } } },
    { $sort: { taskCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        taskCount: 1,
        'user.name': 1,
        'user.email': 1,
        'user.avatar': 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    report: {
      totalUsers,
      activeUsers,
      totalProjects,
      totalTasks,
      completedTasks,
      completionRate: totalTasks
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0,
      topUsers,
    },
  });
});

module.exports = {
  getDashboardStats,
  getProductivityChart,
  getProjectStats,
  getAdminReport,
};
