// frontend/src/components/AppLayout.jsx
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'My Tasks',
  '/analytics': 'Analytics',
  '/notifications': 'Notifications',
  '/profile': 'My Profile',
  '/admin': 'Admin Panel',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  const title = TITLES[pathname] ||
    (pathname.startsWith('/projects/') ? 'Project Details' : 'TaskFlow Pro');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area — offset on large screens for sidebar */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          <div className="page-enter max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
