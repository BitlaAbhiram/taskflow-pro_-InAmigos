// frontend/src/components/Topbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useData';
import { notificationService } from '../services/apiServices';
import toast from 'react-hot-toast';

export default function Topbar({ onMenuClick, title }) {
  const { notifications, unreadCount, refetch } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleMarkAll = async () => {
    await notificationService.markAllRead();
    refetch();
    toast.success('All notifications marked as read');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-5 sticky top-0 z-10">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          ☰
        </button>
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
      </div>

      {/* Right: notifications */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 text-lg"
        >
          🔔
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-primary-600 hover:underline">
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No notifications yet 🎉
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-slate-50 last:border-0 text-sm ${
                    !n.isRead ? 'bg-primary-50' : ''
                  }`}
                >
                  <p className={`${!n.isRead ? 'font-medium' : 'text-slate-600'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}

            <div className="px-4 py-2 border-t border-slate-100">
              <Link
                to="/notifications"
                onClick={() => setNotifOpen(false)}
                className="text-xs text-primary-600 hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
