// frontend/src/pages/Projects.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useData';
import { projectService } from '../services/apiServices';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#6366f1','#10b981','#f59e0b','#ef4444',
  '#3b82f6','#8b5cf6','#ec4899','#14b8a6',
];

function CreateProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', dueDate: '' });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await projectService.create(form);
      toast.success('Project created!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold">New Project</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="label">Project Name *</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="e.g. Product Redesign" required autoFocus />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} placeholder="What's this project about?" />
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 mt-1">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects, loading, refetch } = useProjects();
  const [modal, setModal] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Projects</h2>
          <p className="text-sm text-slate-400">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary">+ New Project</button>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">📁</p>
          <p className="text-slate-500 font-medium">No projects yet</p>
          <p className="text-sm text-slate-400 mb-4">Create your first project to start tracking tasks.</p>
          <button onClick={() => setModal(true)} className="btn-primary mx-auto">Create project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <Link key={project._id} to={`/projects/${project._id}`}
              className="card hover:shadow-md transition-all hover:-translate-y-0.5 group block">
              {/* Color bar */}
              <div className="w-full h-1.5 rounded-full mb-4" style={{ backgroundColor: project.color }} />

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                  {project.name}
                </h3>
                <span className={`badge text-xs ${
                  project.status === 'active' ? 'bg-green-100 text-green-700' :
                  project.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {project.status}
                </span>
              </div>

              {project.description && (
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{project.description}</p>
              )}

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{project.completedCount || 0} / {project.taskCount || 0} tasks done</span>
                  <span>
                    {project.taskCount > 0
                      ? Math.round((project.completedCount / project.taskCount) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: project.taskCount > 0
                        ? `${(project.completedCount / project.taskCount) * 100}%`
                        : '0%',
                      backgroundColor: project.color,
                    }}
                  />
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members?.slice(0, 4).map((m) => (
                    <div key={m.user?._id}
                      title={m.user?.name}
                      className="w-7 h-7 rounded-full bg-primary-600 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                      {m.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {project.members?.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-500 text-[10px] font-bold">
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                {project.dueDate && (
                  <span className="text-xs text-slate-400">
                    Due {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {modal && <CreateProjectModal onClose={() => setModal(false)} onCreated={refetch} />}
    </div>
  );
}
