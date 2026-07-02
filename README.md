# TaskFlow Pro 🚀

A full-stack SaaS project management and team collaboration platform.  
**React + Vite + Tailwind** on the frontend · **Node.js + Express + MongoDB + JWT** on the backend.

---

## 📁 Project Structure

```
taskflow-pro/
├── backend/
│   ├── config/         → MongoDB connection
│   ├── controllers/    → Business logic (auth, tasks, projects, analytics…)
│   ├── middleware/     → JWT auth, error handling, validation
│   ├── models/         → Mongoose schemas (User, Project, Task, Notification)
│   ├── routes/         → Express route definitions
│   ├── utils/          → Token generator, notification helper, seed script
│   ├── server.js       → Express entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/ → Sidebar, Topbar, TaskCard, TaskModal, StatCard…
│   │   ├── context/    → AuthContext (global auth state)
│   │   ├── hooks/      → useData (useTasks, useProjects, useDashboard…)
│   │   ├── pages/      → Dashboard, Projects, ProjectDetail, Tasks,
│   │   │                  Analytics, Notifications, Profile, Admin,
│   │   │                  Login, Register
│   │   ├── services/   → Axios instance + all API call functions
│   │   ├── App.jsx     → Route definitions
│   │   └── main.jsx    → React entry point
│   └── package.json
│
├── .env.example        → Environment variable template
└── package.json        → Root workspace scripts
```

---

## ✅ Features

| Feature | Details |
|---|---|
| Auth | Register · Login · Logout · JWT · Role-based (Admin / User) |
| Dashboard | Stats cards · Recent activity · My tasks |
| Projects | Create · Edit · Delete · Progress bar · Team management |
| Kanban Board | Todo / In Progress / Review / Done · Quick status moves |
| Task Management | Full CRUD · Status · Priority · Assignee · Due dates · Tags · Comments |
| Analytics | Area chart · Pie chart · Bar chart · Productivity trends |
| Notifications | In-app · Unread badge · Mark read · Delete |
| Profile | Edit profile · Change password |
| Admin Panel | User table · Role change · Activate/Deactivate · Platform report |

---

## 🖥️ Running Locally (Step by Step)

### Prerequisites

Make sure these are installed:

```bash
node --version    # v18 or higher required
npm --version     # v9+
mongod --version  # MongoDB v6+ OR use MongoDB Atlas (free cloud)
```

---

### Step 1 — Clone / Download the project

```bash
# If using git
git clone https://github.com/yourname/taskflow-pro.git
cd taskflow-pro

# Or just unzip the downloaded folder and cd into it
cd taskflow-pro
```

---

### Step 2 — Install all dependencies

```bash
# From the project root — installs both backend and frontend
npm run install:all
```

Or install them separately:

```bash
cd backend  && npm install
cd ../frontend && npm install
```

---

### Step 3 — Configure environment variables

```bash
# Copy the example file
cp .env.example backend/.env
```

Open `backend/.env` and fill in your values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskflow-pro
JWT_SECRET=pick_any_long_random_string_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Create the frontend env file:

```bash
echo "VITE_API_BASE_URL=http://localhost:5000/api" > frontend/.env
```

---

### Step 4 — Start MongoDB

**Option A — Local MongoDB:**
```bash
mongod
# Or on macOS with Homebrew:
brew services start mongodb-community
```

**Option B — MongoDB Atlas (free cloud, no install needed):**
1. Sign up at https://cloud.mongodb.com (free tier — no credit card)
2. Create a free M0 cluster
3. Click "Connect" → "Drivers" → copy the connection string
4. Replace `MONGO_URI` in `backend/.env` with your Atlas URI

---

### Step 5 — Seed the database (demo data)

```bash
cd backend
npm run seed
```

This creates 4 users, 3 projects, 20 tasks, and notifications.

**Login credentials (all use password: `password123`):**

| Email | Role |
|---|---|
| admin@taskflow.pro | Admin (full access) |
| alice@taskflow.pro | User — Product Manager |
| bob@taskflow.pro | User — Developer |
| carol@taskflow.pro | User — Designer |

---

### Step 6 — Start the development servers

**Option A — Run both in one terminal (recommended):**
```bash
# From the project root
npm install        # installs concurrently
npm run dev
```

**Option B — Two separate terminals:**
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

**Open in browser:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

---

## 🌐 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | Public | Create account |
| POST | /auth/login | Public | Login, returns JWT |
| POST | /auth/logout | JWT | Logout |
| GET  | /auth/me | JWT | Get current user |

### Projects
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET    | /projects | JWT | List my projects |
| POST   | /projects | JWT | Create project |
| GET    | /projects/:id | JWT | Get project |
| PUT    | /projects/:id | JWT | Update project |
| DELETE | /projects/:id | JWT | Delete project + tasks |
| POST   | /projects/:id/members | JWT | Add team member |
| DELETE | /projects/:id/members/:userId | JWT | Remove member |

### Tasks
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET    | /tasks | JWT | List tasks (filterable) |
| POST   | /tasks | JWT | Create task |
| GET    | /tasks/:id | JWT | Get task |
| PUT    | /tasks/:id | JWT | Update task |
| PATCH  | /tasks/:id/status | JWT | Update status only |
| DELETE | /tasks/:id | JWT | Delete task |
| POST   | /tasks/:id/comments | JWT | Add comment |

### Analytics
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /analytics/dashboard | JWT | Dashboard stats |
| GET | /analytics/productivity?days=30 | JWT | Chart data |
| GET | /analytics/projects | JWT | Per-project breakdown |
| GET | /analytics/admin | Admin | Platform report |

---

## 🚀 Free Deployment Guide

### Architecture for free deployment
```
MongoDB Atlas (free)  →  Railway backend  →  Vercel frontend
```

---

### Step 1 — Deploy MongoDB (MongoDB Atlas — Free Forever)

1. Go to https://cloud.mongodb.com → Sign up (free)
2. Create a **free M0 cluster** (AWS, any region)
3. Under **Database Access** → Add a database user (username + password)
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all — fine for dev/MVP)
5. Click **Connect** → **Drivers** → copy the URI:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskflow-pro
   ```
6. Save this URI — you'll need it for the backend environment variables.

---

### Step 2 — Deploy Backend (Railway — Free Hobby Tier)

Railway gives you $5/month free credit — enough for a small Node.js app.

1. Go to https://railway.app → Sign up with GitHub
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Set the **root directory** to `backend`
5. Under **Variables**, add all backend env vars:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskflow-pro
JWT_SECRET=a_very_long_random_secret_string_at_least_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-app.vercel.app
```

6. Railway auto-detects Node.js and runs `npm start`
7. After deploy, copy your Railway URL: `https://taskflow-pro-production.up.railway.app`

**Alternative backend hosts (also free):**
- **Render** (https://render.com) — free web service, sleeps after 15min inactivity
- **Fly.io** (https://fly.io) — free tier with 256MB RAM

---

### Step 3 — Deploy Frontend (Vercel — Free Forever)

1. Go to https://vercel.com → Sign up with GitHub
2. Click **Add New Project** → import your repo
3. Set **Root Directory** to `frontend`
4. Set **Build Command** to `npm run build`
5. Set **Output Directory** to `dist`
6. Under **Environment Variables**, add:

```env
VITE_API_BASE_URL=https://taskflow-pro-production.up.railway.app/api
```

7. Click **Deploy** — Vercel gives you a free `.vercel.app` domain instantly.

**Alternative frontend hosts:**
- **Netlify** (https://netlify.com) — also free, drag-and-drop the `dist` folder
- **Cloudflare Pages** (https://pages.cloudflare.com) — fastest CDN, free tier

---

### Step 4 — Run the seed on production (optional)

After deploying the backend, open a terminal and run:

```bash
cd backend
MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/taskflow-pro" \
JWT_SECRET="your_jwt_secret" \
node utils/seedData.js
```

---

### Step 5 — Update CORS

In Railway, update the `CLIENT_URL` variable to match your Vercel URL:

```env
CLIENT_URL=https://taskflow-pro.vercel.app
```

Then redeploy the backend (Railway auto-redeploys on env var change).

---

## 🔒 Production Checklist

Before going live, make sure to:

- [ ] Set a strong `JWT_SECRET` (32+ random chars — use `openssl rand -hex 32`)
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use MongoDB Atlas with IP restrictions instead of `0.0.0.0/0`
- [ ] Add your real domain to `CLIENT_URL` for CORS
- [ ] Remove or protect the `/api/health` endpoint
- [ ] Set up MongoDB Atlas backups (free tier includes daily snapshots)
- [ ] Add a custom domain in Vercel (free with your own domain)

---

## 🛠️ Common Issues

| Problem | Fix |
|---|---|
| `ECONNREFUSED` on MongoDB | Make sure `mongod` is running locally, or check your Atlas URI |
| CORS error in browser | Check `CLIENT_URL` in backend `.env` matches your frontend URL exactly |
| JWT expired on refresh | Token lifetime is 7 days — log out and back in |
| Vite proxy not working | Make sure `VITE_API_BASE_URL=/api` (not full URL) for local dev with proxy |
| `npm run dev` fails | Run `npm run install:all` first from the project root |
| Seed fails | Check `MONGO_URI` in `backend/.env` is correct and MongoDB is running |

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| HTTP client | Axios |
| Charts | Recharts |
| Date formatting | date-fns |
| Notifications | react-hot-toast |
| Backend | Node.js + Express 4 |
| Database | MongoDB + Mongoose 8 |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| Security | Helmet · CORS · express-rate-limit |
| Validation | express-validator |

---

© 2026 TaskFlow Pro · Built for the investor pitch MVP
