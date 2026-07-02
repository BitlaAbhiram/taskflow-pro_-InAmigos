// frontend/src/App.jsx
// ──────────────────────────────────────────────────────────
// Root component: wraps the app in AuthProvider, defines all
// React Router v6 routes, and applies layout / guards.
// ──────────────────────────────────────────────────────────

import { Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute, AdminRoute } from './components/ProtectedRoute';

// Layout
import AppLayout from './components/AppLayout';

// Public pages
import Login    from './pages/Login';
import Register from './pages/Register';

// Protected pages
import Dashboard     from './pages/Dashboard';
import Projects      from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks         from './pages/Tasks';
import Analytics     from './pages/Analytics';
import Notifications from './pages/Notifications';
import Profile       from './pages/Profile';
import Admin         from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ── Public routes (redirect to /dashboard if logged in) ── */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ── Protected routes (require valid JWT) ─────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"          element={<Dashboard />} />
            <Route path="/projects"           element={<Projects />} />
            <Route path="/projects/:id"       element={<ProjectDetail />} />
            <Route path="/tasks"              element={<Tasks />} />
            <Route path="/analytics"          element={<Analytics />} />
            <Route path="/notifications"      element={<Notifications />} />
            <Route path="/profile"            element={<Profile />} />

            {/* ── Admin-only routes ──────────────────────────── */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
        </Route>

        {/* ── Root redirect ─────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── 404 catch-all ─────────────────────────────────── */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <p className="text-6xl font-bold text-slate-200 mb-4">404</p>
              <p className="text-slate-500 mb-6">Page not found</p>
              <a href="/dashboard" className="btn-primary inline-flex">Go to Dashboard</a>
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}
