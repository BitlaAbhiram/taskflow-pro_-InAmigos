// frontend/src/components/TaskCard.jsx
import { format, isPast, isToday } from 'date-fns';

const PRIORITY_STYLES = {
  urgent: 'bg-red-100 text-red-700',
  high:   'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-slate-100 text-slate-600',
};

const STATUS_STYLES = {
  'todo':        'bg-slate-100 text-slate-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'review':      'bg-purple-100 text-purple-700',
  'done':        'bg-green-100 text-green-700',
};

export default function TaskCard({ task, onClick }) {
  const isDue = task.dueDate && !isPast(new Date(task.dueDate));
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <div
      onClick={() => onClick?.(task)}
      className="card hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
    >
      {/* Header: priority + status */}
      <div className="flex items-center justify-between mb-3">
        <span className={`badge ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`badge ${STATUS_STYLES[task.status]}`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Footer: project + due date + assignee */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {task.project?.color && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: task.project.color }}
            />
          )}
          <span className="text-xs text-slate-400 truncate max-w-[100px]">
            {task.project?.name || 'No project'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span
              className={`text-xs font-medium ${
                isOverdue
                  ? 'text-red-500'
                  : isDueToday
                  ? 'text-orange-500'
                  : 'text-slate-400'
              }`}
            >
              {isOverdue ? '⚠️ ' : isDueToday ? '📅 ' : ''}
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
          {task.assignedTo && (
            <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold">
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
