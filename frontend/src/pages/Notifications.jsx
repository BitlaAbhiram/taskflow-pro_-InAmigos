// frontend/src/pages/Notifications.jsx
import { useNotifications } from '../hooks/useData';
import { notificationService } from '../services/apiServices';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const TYPE_ICON = {
  'task-assigned':    '📌',
  'task-updated':     '✏️',
  'task-completed':   '✅',
  'due-date-reminder':'⏰',
  'comment-added':    '💬',
  'project-invite':   '📁',
};

export default function Notifications() {
  const { notifications, unreadCount, loading, refetch } = useNotifications();

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      refetch();
    } catch { toast.error('Failed to mark as read'); }
  };

  const handleMarkAll = async () => {
    try {
      await notificationService.markAllRead();
      refetch();
      toast.success('All marked as read');
    } catch { toast.error('Failed to update notifications'); }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.delete(id);
      refetch();
    } catch { toast.error('Failed to delete notification'); }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Notifications</h2>
          <p className="text-sm text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn-ghost text-sm">
            Mark all as read
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-medium text-slate-600">No notifications yet</p>
          <p className="text-sm text-slate-400 mt-1">
            You'll be notified about task assignments, comments, and due dates.
          </p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card flex items-start gap-4 transition-all ${
                !n.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50/30' : ''
              }`}
            >
              {/* Icon */}
              <div className="text-2xl flex-shrink-0 mt-0.5">
                {TYPE_ICON[n.type] || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.isRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </span>
                  {n.relatedProject && (
                    <span className="text-xs text-slate-400">
                      · {n.relatedProject.name}
                    </span>
                  )}
                  {n.relatedTask && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      Task: {n.relatedTask.title?.substring(0, 30)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    title="Mark as read"
                    className="w-7 h-7 rounded-full hover:bg-primary-100 flex items-center justify-center text-primary-600 text-xs"
                  >
                    ✓
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  title="Delete"
                  className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
