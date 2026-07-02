// frontend/src/pages/Dashboard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboard } from '../hooks/useData';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { format } from 'date-fns';

const STATUS_COLORS = {
  'todo':        'bg-slate-100 text-slate-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'review':      'bg-purple-100 text-purple-700',
  'done':        'bg-green-100 text-green-700',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, recentTasks, myTasks, loading, refetch } = useDashboard();
  const [taskModal, setTaskModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Here's what's happening across your projects today.
          </p>
        </div>
        <button onClick={() => setTaskModal(true)} className="btn-primary">
          + New Task
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks"    value={stats?.total}       icon="📋" color="indigo" />
        <StatCard label="In Progress"    value={stats?.inProgress}  icon="⚡" color="blue"   />
        <StatCard label="Completed"      value={stats?.done}        icon="✅" color="green"  />
        <StatCard label="Overdue"        value={stats?.overdue}     icon="⚠️" color="red"   sub={stats?.overdue > 0 ? 'Needs attention' : 'All on track'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatCard label="To Do"          value={stats?.todo}        icon="📝" color="slate"  />
        <StatCard label="In Review"      value={stats?.review}      icon="👀" color="purple" />
        <StatCard label="Projects"       value={stats?.projectCount} icon="📁" color="orange" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Activity</h3>
            <Link to="/tasks" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No tasks yet — create your first one!</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task._id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.project?.color || '#6366f1' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.project?.name}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[task.status]} flex-shrink-0`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My assigned tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Assigned to Me</h3>
            <Link to="/tasks" className="text-xs text-primary-600 hover:underline">View all</Link>
          </div>
          {myTasks.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No tasks assigned to you yet.</p>
          ) : (
            <div className="space-y-2">
              {myTasks.map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.project?.color || '#6366f1' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.project?.name}</p>
                  </div>
                  {task.dueDate && (
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {taskModal && (
        <TaskModal
          onClose={() => setTaskModal(false)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
