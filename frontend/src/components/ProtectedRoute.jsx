// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Redirects unauthenticated users to /login
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading TaskFlow Pro…</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Redirects authenticated users away from auth pages
export function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// Restricts access to admin users only
export function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
