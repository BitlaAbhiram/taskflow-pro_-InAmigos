// frontend/src/pages/ProjectDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useTasks, useUsers } from '../hooks/useData';
import { taskService, projectService } from '../services/apiServices';
import TaskModal from '../components/TaskModal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const COLUMNS = [
  { key: 'todo',        label: 'To Do',      color: 'bg-slate-200' },
  { key: 'in-progress', label: 'In Progress', color: 'bg-blue-200' },
  { key: 'review',      label: 'Review',      color: 'bg-purple-200' },
  { key: 'done',        label: 'Done',        color: 'bg-green-200' },
];

const PRIORITY_DOT = {
  urgent: 'bg-red-500', high: 'bg-orange-400', medium: 'bg-yellow-400', low: 'bg-slate-300',
};

function KanbanCard({ task, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-100 p-3 cursor-pointer group hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-slate-800 leading-tight flex-1">{task.title}</p>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${PRIORITY_DOT[task.priority]}`} title={task.priority} />
      </div>
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-1">
          {task.tags?.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(task)} className="text-slate-400 hover:text-primary-600 p-1 text-xs">✏️</button>
          <button onClick={() => onDelete(task._id)} className="text-slate-400 hover:text-red-500 p-1 text-xs">🗑️</button>
        </div>
        {task.assignedTo && (
          <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-[8px] font-bold">
            {task.assignedTo.name?.charAt(0)}
          </div>
        )}
      </div>
      {/* Quick status move buttons */}
      <div className="flex gap-1 mt-2 pt-2 border-t border-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
        {COLUMNS.filter((c) => c.key !== task.status).map((c) => (
          <button
            key={c.key}
            onClick={() => onStatusChange(task._id, c.key)}
            className="text-[9px] px-1.5 py-0.5 bg-slate-100 hover:bg-primary-100 text-slate-500 hover:text-primary-600 rounded transition-colors"
          >
            → {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { project, loading: pLoading, refetch: refetchProject } = useProject(id);
  const { tasks, loading: tLoading, refetch: refetchTasks } = useTasks({ project: id });
  const { users } = useUsers();
  const [editTask, setEditTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'list' | 'team'

  const refetchAll = () => { refetchTasks(); refetchProject(); };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateStatus(taskId, status);
      refetchTasks();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.delete(taskId);
      toast.success('Task deleted');
      refetchTasks();
    } catch { toast.error('Failed to delete task'); }
  };

  const handleAddMember = async () => {
    const u = users.find((u) => u.email === addMemberEmail);
    if (!u) return toast.error('User not found with that email');
    try {
      await projectService.addMember(id, { userId: u._id });
      toast.success(`${u.name} added to project`);
      setAddMemberEmail('');
      refetchProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await projectService.removeMember(id, userId);
      toast.success('Member removed');
      refetchProject();
    } catch { toast.error('Failed to remove member'); }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and ALL its tasks? This cannot be undone.')) return;
    try {
      await projectService.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch { toast.error('Failed to delete project'); }
  };

  if (pLoading || tLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!project) return <div className="card text-center py-16 text-slate-400">Project not found.</div>;

  const isOwner = project.owner?._id === user?._id || isAdmin;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.color }} />
          <div>
            <h2 className="text-xl font-bold text-slate-800">{project.name}</h2>
            {project.description && <p className="text-sm text-slate-400">{project.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTaskModal(true)} className="btn-primary">+ Add Task</button>
          {isOwner && (
            <button onClick={handleDeleteProject} className="btn-danger">Delete Project</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[['board','🗂 Board'],['list','📋 List'],['team','👥 Team']].map(([k,l]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === k ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}>{l}</button>
        ))}
      </div>

      {/* Kanban Board */}
      {activeTab === 'board' && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{col.label}</span>
                  <span className="ml-auto text-xs bg-white text-slate-400 rounded-full px-2 py-0.5 font-medium">{colTasks.length}</span>
                </div>
                <div className="space-y-2 min-h-16">
                  {colTasks.map((t) => (
                    <KanbanCard
                      key={t._id} task={t}
                      onEdit={(task) => { setEditTask(task); setShowTaskModal(true); }}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="w-full mt-2 py-1.5 text-xs text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors border border-dashed border-slate-200 hover:border-primary-300"
                >
                  + Add task
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {activeTab === 'list' && (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Task','Status','Priority','Assignee','Due'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tasks.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">{t.title}</td>
                  <td className="px-4 py-3">
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white"
                    >
                      {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3"><span className="badge bg-slate-100 text-slate-600">{t.priority}</span></td>
                  <td className="px-4 py-3 text-slate-500">{t.assignedTo?.name || '—'}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No tasks yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Team view */}
      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Team Members ({project.members?.length})</h3>
            <div className="space-y-3">
              {project.members?.map((m) => (
                <div key={m.user?._id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
                    {m.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{m.user?.name}</p>
                    <p className="text-xs text-slate-400">{m.user?.email} · {m.role}</p>
                  </div>
                  {isOwner && m.role !== 'owner' && (
                    <button onClick={() => handleRemoveMember(m.user?._id)}
                      className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {isOwner && (
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-3">Add Member</h3>
              <div className="flex gap-2">
                <input
                  type="email" className="input flex-1" placeholder="user@example.com"
                  value={addMemberEmail} onChange={(e) => setAddMemberEmail(e.target.value)}
                  list="user-emails"
                />
                <datalist id="user-emails">
                  {users.map((u) => <option key={u._id} value={u.email}>{u.name}</option>)}
                </datalist>
                <button onClick={handleAddMember} className="btn-primary">Add</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          task={editTask}
          defaultProjectId={id}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSaved={refetchAll}
        />
      )}
    </div>
  );
}
