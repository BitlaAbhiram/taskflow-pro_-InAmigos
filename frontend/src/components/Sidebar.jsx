// frontend/src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon, label, end }) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-primary-600 text-white shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`
    }
  >
    <span className="text-lg">{icon}</span>
    {label}
  </NavLink>
);

export default function Sidebar({ open, onClose }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-30
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
            TF
          </div>
          <span className="font-bold text-lg tracking-tight">TaskFlow Pro</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-2">
            Main
          </p>
          <NavItem to="/dashboard" end icon="🏠" label="Dashboard" />
          <NavItem to="/projects" icon="📁" label="Projects" />
          <NavItem to="/tasks" icon="✅" label="My Tasks" />
          <NavItem to="/analytics" icon="📊" label="Analytics" />
          <NavItem to="/notifications" icon="🔔" label="Notifications" />

          {isAdmin && (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mt-5 mb-2">
                Admin
              </p>
              <NavItem to="/admin" icon="⚙️" label="Admin Panel" />
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 text-sm transition-colors"
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
