// frontend/src/components/StatCard.jsx
export default function StatCard({ label, value, icon, color, sub }) {
  const colorMap = {
    indigo:  'bg-indigo-50 text-indigo-600',
    green:   'bg-green-50 text-green-600',
    orange:  'bg-orange-50 text-orange-600',
    red:     'bg-red-50 text-red-600',
    blue:    'bg-blue-50 text-blue-600',
    purple:  'bg-purple-50 text-purple-600',
    slate:   'bg-slate-100 text-slate-600',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${colorMap[color] || colorMap.slate}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
