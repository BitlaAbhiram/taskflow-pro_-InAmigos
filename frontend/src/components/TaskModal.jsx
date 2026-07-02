// frontend/src/components/TaskModal.jsx
import { useState, useEffect } from 'react';
import { taskService } from '../services/apiServices';
import { useUsers } from '../hooks/useData';
import { useProjects } from '../hooks/useData';
import toast from 'react-hot-toast';

export default function TaskModal({ task, defaultProjectId, onClose, onSaved }) {
  const isEdit = Boolean(task?._id);
  const { users } = useUsers();
  const { projects } = useProjects();

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    project: task?.project?._id || task?.project || defaultProjectId || '',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.substring(0, 10) : '',
    tags: task?.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.project) return toast.error('Please select a project');

    setSaving(true);
    try {
      const payload = {
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (isEdit) {
        await taskService.update(task._id, payload);
        toast.success('Task updated');
      } else {
        await taskService.create(payload);
        toast.success('Task created');
      }
      onSaved?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={set('title')} placeholder="What needs to be done?" required />
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={3} value={form.description} onChange={set('description')} placeholder="Add details..." />
          </div>

          {/* Project */}
          <div>
            <label className="label">Project *</label>
            <select className="input" value={form.project} onChange={set('project')} required>
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={set('status')}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Row: Assignee + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Assign to</label>
              <select className="input" value={form.assignedTo} onChange={set('assignedTo')}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input className="input" value={form.tags} onChange={set('tags')} placeholder="frontend, bug, design" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
