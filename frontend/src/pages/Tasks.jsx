// frontend/src/pages/Tasks.jsx
import { useState } from 'react';
import { useTasks } from '../hooks/useData';
import { taskService } from '../services/apiServices';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import toast from 'react-hot-toast';

const STATUSES  = ['', 'todo', 'in-progress', 'review', 'done'];
const PRIORITIES = ['', 'urgent', 'high', 'medium', 'low'];

export default function Tasks() {
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [view, setView] = useState('grid'); // 'grid' | 'list'

  // Build params — omit empty strings
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '')
  );
  const { tasks, loading, refetch } = useTasks(params);

  const setFilter = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const handleEdit = (task) => { setSelectedTask(task); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.delete(id);
      toast.success('Task deleted');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await taskService.updateStatus(id, status);
      refetch();
    } catch { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">My Tasks</h2>
          <p className="text-sm text-slate-400">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={() => { setSelectedTask(null); setShowModal(true); }} className="btn-primary">
          + New Task
        </button>
      </div>

      {/* Filters bar */}
      <div className="card flex flex-wrap gap-3 items-center">
        <input
          type="text"
          className="input max-w-xs"
          placeholder="🔍 Search tasks…"
          value={filters.search}
          onChange={setFilter('search')}
        />
        <select className="input w-40" value={filters.status} onChange={setFilter('status')}>
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace('-', ' ')}</option>
          ))}
        </select>
        <select className="input w-36" value={filters.priority} onChange={setFilter('priority')}>
          <option value="">All priorities</option>
          {PRIORITIES.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {(filters.status || filters.priority || filters.search) && (
          <button
            onClick={() => setFilters({ status: '', priority: '', search: '' })}
            className="text-xs text-red-400 hover:text-red-600 font-medium"
          >
            Clear filters
          </button>
        )}

        {/* View toggle */}
        <div className="ml-auto flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setView('grid')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${view === 'grid' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
            ⊞ Grid
          </button>
          <button onClick={() => setView('list')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${view === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}>
            ☰ List
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && tasks.length === 0 && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">✅</p>
          <p className="font-medium text-slate-600">No tasks found</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">
            {filters.status || filters.priority || filters.search
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
          <button
            onClick={() => { setSelectedTask(null); setShowModal(true); }}
            className="btn-primary mx-auto"
          >
            + Create Task
          </button>
        </div>
      )}

      {/* Grid view */}
      {!loading && tasks.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div key={task._id} className="relative group">
              <TaskCard task={task} onClick={handleEdit} />
              {/* Hover actions overlay */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(task); }}
                  className="w-7 h-7 bg-white shadow rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 text-xs"
                >✏️</button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}
                  className="w-7 h-7 bg-white shadow rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 text-xs"
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && tasks.length > 0 && view === 'list' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Title', 'Project', 'Status', 'Priority', 'Assignee', 'Due Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px]">
                    <p className="truncate">{task.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.project?.color || '#6366f1' }} />
                      <span className="text-slate-500 truncate max-w-[100px]">{task.project?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${
                      task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      task.priority === 'high'   ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                   'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-[9px] font-bold">
                          {task.assignedTo.name?.charAt(0)}
                        </div>
                        <span className="text-xs truncate">{task.assignedTo.name}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(task)} className="p-1 text-slate-400 hover:text-primary-600">✏️</button>
                      <button onClick={() => handleDelete(task._id)} className="p-1 text-slate-400 hover:text-red-500">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => { setShowModal(false); setSelectedTask(null); }}
          onSaved={refetch}
        />
      )}
    </div>
  );
}
