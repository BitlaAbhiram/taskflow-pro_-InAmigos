// frontend/src/pages/Analytics.jsx
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useProductivity, useDashboard } from '../hooks/useData';
import { analyticsService } from '../services/apiServices';
import { useFetch } from '../hooks/useData';
import StatCard from '../components/StatCard';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

// ─── Tooltip component for Recharts ──────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-3 py-2 text-xs">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [days, setDays] = useState(30);
  const { completed, created, loading: chartLoading } = useProductivity(days);
  const { stats, loading: statsLoading } = useDashboard();
  const { data: projectData, loading: projectLoading } = useFetch(
    () => analyticsService.projects()
  );

  // Merge completed + created into one time-series dataset
  const mergedDays = (() => {
    const map = {};
    completed.forEach((d) => { map[d._id] = { date: d._id, completed: d.count, created: 0 }; });
    created.forEach((d) => {
      if (map[d._id]) map[d._id].created = d.count;
      else map[d._id] = { date: d._id, completed: 0, created: d.count };
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  })();

  // Pie chart data for task status
  const statusPie = stats
    ? [
        { name: 'To Do',       value: stats.todo,       color: '#94a3b8' },
        { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
        { name: 'Review',      value: stats.review,     color: '#8b5cf6' },
        { name: 'Done',        value: stats.done,       color: '#10b981' },
      ].filter((d) => d.value > 0)
    : [];

  // Bar data for project breakdown
  const projectBarData = (projectData?.projectStats || [])
    .filter((p) => p.project)
    .map((p) => {
      const row = { name: p.project.name?.substring(0, 14) };
      p.statuses.forEach((s) => { row[s.status] = s.count; });
      return row;
    });

  const loading = chartLoading || statsLoading || projectLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Analytics</h2>
        <p className="text-sm text-slate-400">Productivity insights across your projects</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks"   value={stats?.total}       icon="📋" color="indigo" />
        <StatCard label="Completed"     value={stats?.done}        icon="✅" color="green"  />
        <StatCard label="Completion %"
          value={stats?.total ? `${Math.round((stats.done / stats.total) * 100)}%` : '0%'}
          icon="📈" color="blue"
        />
        <StatCard label="Overdue"       value={stats?.overdue}     icon="⚠️" color="red"   />
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && (
        <>
          {/* Productivity over time */}
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-800">Productivity Over Time</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tasks created vs completed per day</p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {[7, 14, 30, 90].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      days === d ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {mergedDays.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                No data for this period yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={mergedDays} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="created"   name="Created"   stroke="#10b981" fill="url(#gradCreated)"   strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#6366f1" fill="url(#gradCompleted)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Two-column row: Pie + Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Status pie */}
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-1">Tasks by Status</h3>
              <p className="text-xs text-slate-400 mb-4">Current distribution across all projects</p>
              {statusPie.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No tasks yet</div>
              ) : (
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                        dataKey="value" stroke="none">
                        {statusPie.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 flex-1">
                    {statusPie.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Project bar chart */}
            <div className="card">
              <h3 className="font-semibold text-slate-800 mb-1">Tasks by Project</h3>
              <p className="text-xs text-slate-400 mb-4">Status breakdown per project</p>
              {projectBarData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No project data</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={projectBarData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="todo"        name="To Do"       fill="#94a3b8" stackId="a" radius={[0,0,0,0]} />
                    <Bar dataKey="in-progress" name="In Progress" fill="#3b82f6" stackId="a" />
                    <Bar dataKey="review"      name="Review"      fill="#8b5cf6" stackId="a" />
                    <Bar dataKey="done"        name="Done"        fill="#10b981" stackId="a" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="card">
            <h3 className="font-semibold text-slate-800 mb-4">Task Priority Heatmap</h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Urgent', color: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50'    },
                { label: 'High',   color: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
                { label: 'Medium', color: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
                { label: 'Low',    color: 'bg-slate-300',  text: 'text-slate-600',  bg: 'bg-slate-50'  },
              ].map(({ label, color, text, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4 text-center`}>
                  <div className={`w-3 h-3 ${color} rounded-full mx-auto mb-2`} />
                  <p className={`text-xs font-semibold ${text} uppercase tracking-wide`}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
