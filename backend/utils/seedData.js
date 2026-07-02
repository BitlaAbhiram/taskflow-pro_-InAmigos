// backend/utils/seedData.js
// ──────────────────────────────────────────────────────────
// Run:  npm run seed  (from the backend/ directory)
// Drops existing data and inserts realistic demo data
// including admin + 3 users, 3 projects, and 20 tasks.
// ──────────────────────────────────────────────────────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow-pro';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Wipe existing data ───────────────────────────────
    await Promise.all([
      User.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      Notification.deleteMany(),
    ]);
    console.log('🗑️  Cleared existing collections');

    // ── Create users ─────────────────────────────────────
    const hashedPw = await bcrypt.hash('password123', 10);

    const [admin, alice, bob, carol] = await User.insertMany([
      {
        name: 'Admin User',
        email: 'admin@taskflow.pro',
        password: hashedPw,
        role: 'admin',
        jobTitle: 'Platform Administrator',
        isActive: true,
      },
      {
        name: 'Alice Chen',
        email: 'alice@taskflow.pro',
        password: hashedPw,
        role: 'user',
        jobTitle: 'Product Manager',
        isActive: true,
      },
      {
        name: 'Bob Kumar',
        email: 'bob@taskflow.pro',
        password: hashedPw,
        role: 'user',
        jobTitle: 'Senior Developer',
        isActive: true,
      },
      {
        name: 'Carol Davis',
        email: 'carol@taskflow.pro',
        password: hashedPw,
        role: 'user',
        jobTitle: 'UX Designer',
        isActive: true,
      },
    ]);
    console.log('👥 Created 4 users');

    // ── Create projects ──────────────────────────────────
    const [projectA, projectB, projectC] = await Project.insertMany([
      {
        name: 'TaskFlow Pro MVP',
        description: 'Build and launch the core MVP of the TaskFlow Pro SaaS platform.',
        owner: admin._id,
        color: '#6366f1',
        status: 'active',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        members: [
          { user: admin._id, role: 'owner' },
          { user: alice._id, role: 'editor' },
          { user: bob._id, role: 'editor' },
          { user: carol._id, role: 'viewer' },
        ],
      },
      {
        name: 'Marketing Website Redesign',
        description: 'Redesign and rebuild the public marketing site with new branding.',
        owner: alice._id,
        color: '#10b981',
        status: 'active',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        members: [
          { user: alice._id, role: 'owner' },
          { user: carol._id, role: 'editor' },
          { user: bob._id, role: 'viewer' },
        ],
      },
      {
        name: 'Q3 Investor Pitch Deck',
        description: 'Prepare materials and financials for Series A investor outreach.',
        owner: admin._id,
        color: '#f59e0b',
        status: 'active',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        members: [
          { user: admin._id, role: 'owner' },
          { user: alice._id, role: 'editor' },
        ],
      },
    ]);
    console.log('📁 Created 3 projects');

    // ── Create tasks ─────────────────────────────────────
    const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
    const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

    const tasks = await Task.insertMany([
      // ── Project A — TaskFlow Pro MVP ──
      {
        title: 'Set up MongoDB schemas and API boilerplate',
        description: 'Design User, Project, Task, and Notification schemas. Wire up Express routes.',
        project: projectA._id, createdBy: admin._id, assignedTo: bob._id,
        status: 'done', priority: 'high',
        completedAt: daysAgo(5), createdAt: daysAgo(10),
        tags: ['backend', 'database'],
      },
      {
        title: 'Implement JWT authentication system',
        description: 'Register, login, logout, refresh token, and role-based route protection.',
        project: projectA._id, createdBy: admin._id, assignedTo: bob._id,
        status: 'done', priority: 'high',
        completedAt: daysAgo(3), createdAt: daysAgo(8),
        tags: ['backend', 'auth'],
      },
      {
        title: 'Build React dashboard with stats cards',
        description: 'Overview page showing task counts, recent activity, and productivity metrics.',
        project: projectA._id, createdBy: alice._id, assignedTo: carol._id,
        status: 'in-progress', priority: 'high',
        dueDate: daysFromNow(3), createdAt: daysAgo(4),
        tags: ['frontend', 'dashboard'],
      },
      {
        title: 'Design Kanban board UI component',
        description: 'Drag-and-drop Kanban board with todo / in-progress / review / done columns.',
        project: projectA._id, createdBy: alice._id, assignedTo: carol._id,
        status: 'in-progress', priority: 'high',
        dueDate: daysFromNow(5), createdAt: daysAgo(3),
        tags: ['frontend', 'ui'],
      },
      {
        title: 'Write API integration tests',
        description: 'Cover auth, CRUD for tasks and projects, and edge cases.',
        project: projectA._id, createdBy: bob._id, assignedTo: bob._id,
        status: 'todo', priority: 'medium',
        dueDate: daysFromNow(10), createdAt: daysAgo(2),
        tags: ['testing', 'backend'],
      },
      {
        title: 'Add real-time notifications system',
        description: 'In-app notifications for task assignment, comments, and due dates.',
        project: projectA._id, createdBy: admin._id, assignedTo: bob._id,
        status: 'review', priority: 'medium',
        dueDate: daysFromNow(6), createdAt: daysAgo(5),
        tags: ['backend', 'notifications'],
      },
      {
        title: 'Implement analytics and charts page',
        description: 'Productivity graphs using Recharts. Show completed vs created over time.',
        project: projectA._id, createdBy: alice._id, assignedTo: alice._id,
        status: 'todo', priority: 'medium',
        dueDate: daysFromNow(12), createdAt: daysAgo(1),
        tags: ['frontend', 'analytics'],
      },
      {
        title: 'Set up CI/CD pipeline on Railway',
        description: 'Auto-deploy backend on push to main. Configure env vars in the dashboard.',
        project: projectA._id, createdBy: admin._id, assignedTo: bob._id,
        status: 'todo', priority: 'low',
        dueDate: daysFromNow(20), createdAt: daysAgo(1),
        tags: ['devops'],
      },

      // ── Project B — Marketing Website ──
      {
        title: 'Audit current website performance and UX',
        description: 'Run Lighthouse. Document pain points. Create a redesign brief.',
        project: projectB._id, createdBy: alice._id, assignedTo: carol._id,
        status: 'done', priority: 'high',
        completedAt: daysAgo(6), createdAt: daysAgo(12),
        tags: ['design', 'ux'],
      },
      {
        title: 'Design new landing page wireframes',
        description: 'Hero, features, pricing, testimonials, and CTA sections.',
        project: projectB._id, createdBy: alice._id, assignedTo: carol._id,
        status: 'done', priority: 'high',
        completedAt: daysAgo(2), createdAt: daysAgo(8),
        tags: ['design', 'wireframe'],
      },
      {
        title: 'Build landing page in React + Tailwind',
        description: 'Implement approved wireframes. Mobile-first, accessible.',
        project: projectB._id, createdBy: alice._id, assignedTo: bob._id,
        status: 'in-progress', priority: 'high',
        dueDate: daysFromNow(7), createdAt: daysAgo(2),
        tags: ['frontend'],
      },
      {
        title: 'Write SEO-optimised page copy',
        description: 'Hero tagline, feature descriptions, and meta tags.',
        project: projectB._id, createdBy: alice._id, assignedTo: alice._id,
        status: 'review', priority: 'medium',
        dueDate: daysFromNow(4), createdAt: daysAgo(3),
        tags: ['content', 'seo'],
      },
      {
        title: 'Integrate Mailchimp signup form',
        description: 'Connect the early-access waitlist form to the Mailchimp API.',
        project: projectB._id, createdBy: alice._id, assignedTo: bob._id,
        status: 'todo', priority: 'medium',
        dueDate: daysFromNow(9), createdAt: daysAgo(1),
        tags: ['integration'],
      },

      // ── Project C — Pitch Deck ──
      {
        title: 'Compile market research and TAM/SAM/SOM',
        description: 'Pull analyst reports. Summarise competitive landscape.',
        project: projectC._id, createdBy: admin._id, assignedTo: alice._id,
        status: 'done', priority: 'urgent',
        completedAt: daysAgo(4), createdAt: daysAgo(9),
        tags: ['research', 'strategy'],
      },
      {
        title: 'Draft financial model and revenue projections',
        description: '3-year P&L, MRR growth model, and unit economics.',
        project: projectC._id, createdBy: admin._id, assignedTo: admin._id,
        status: 'in-progress', priority: 'urgent',
        dueDate: daysFromNow(2), createdAt: daysAgo(5),
        tags: ['finance', 'strategy'],
      },
      {
        title: 'Design 12-slide pitch deck in Figma',
        description: 'Problem, solution, market, product, traction, team, ask.',
        project: projectC._id, createdBy: admin._id, assignedTo: carol._id,
        status: 'in-progress', priority: 'urgent',
        dueDate: daysFromNow(3), createdAt: daysAgo(4),
        tags: ['design', 'investor'],
      },
      {
        title: 'Prepare investor one-pager',
        description: 'Single-page executive summary for cold outreach emails.',
        project: projectC._id, createdBy: admin._id, assignedTo: alice._id,
        status: 'todo', priority: 'high',
        dueDate: daysFromNow(5), createdAt: daysAgo(2),
        tags: ['investor', 'content'],
      },
      {
        title: 'Rehearse pitch and gather team feedback',
        description: '3 dry runs with team. Record final version.',
        project: projectC._id, createdBy: admin._id, assignedTo: admin._id,
        status: 'todo', priority: 'medium',
        dueDate: daysFromNow(6), createdAt: daysAgo(1),
        tags: ['investor'],
      },
      // Overdue task for testing overdue badge
      {
        title: 'Submit beta user survey analysis',
        description: 'Collate NPS and qualitative feedback from 50 beta users.',
        project: projectA._id, createdBy: alice._id, assignedTo: alice._id,
        status: 'todo', priority: 'high',
        dueDate: daysAgo(2), // OVERDUE
        createdAt: daysAgo(10),
        tags: ['research'],
      },
      {
        title: 'Fix mobile responsive layout on task modal',
        description: 'The task detail modal breaks on screens < 375px.',
        project: projectA._id, createdBy: bob._id, assignedTo: carol._id,
        status: 'in-progress', priority: 'high',
        dueDate: daysAgo(1), // OVERDUE
        createdAt: daysAgo(3),
        tags: ['frontend', 'bug'],
      },
    ]);
    console.log(`✅ Created ${tasks.length} tasks`);

    // ── Seed notifications ───────────────────────────────
    await Notification.insertMany([
      {
        recipient: bob._id,
        type: 'task-assigned',
        message: 'Admin User assigned you: "Set up MongoDB schemas and API boilerplate"',
        relatedProject: projectA._id,
        isRead: true,
      },
      {
        recipient: carol._id,
        type: 'task-assigned',
        message: 'Alice Chen assigned you: "Build React dashboard with stats cards"',
        relatedProject: projectA._id,
        isRead: false,
      },
      {
        recipient: alice._id,
        type: 'project-invite',
        message: 'You\'ve been added to the project "Q3 Investor Pitch Deck"',
        relatedProject: projectC._id,
        isRead: false,
      },
      {
        recipient: bob._id,
        type: 'project-invite',
        message: 'You\'ve been added to the project "Marketing Website Redesign"',
        relatedProject: projectB._id,
        isRead: true,
      },
    ]);
    console.log('🔔 Created notifications');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('  Login credentials (all use password: password123)');
    console.log('  admin@taskflow.pro  →  Admin  (full access)');
    console.log('  alice@taskflow.pro  →  User   (Product Manager)');
    console.log('  bob@taskflow.pro    →  User   (Developer)');
    console.log('  carol@taskflow.pro  →  User   (Designer)');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
