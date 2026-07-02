// frontend/src/pages/Admin.jsx
import { useState } from 'react';
import { useFetch } from '../hooks/useData';
import { userService, analyticsService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  const { data: usersData,   loading: usersLoading,   refetch: refetchUsers }   = useFetch(() => userService.adminGetAll());
  const { data: reportData,  loading: reportLoading }  = useFetch(() => analyticsService.adminReport());

  const users  = usersData?.users  || [];
  const report = reportData?.report || {};

  const handleToggleActive = async (userId, isActive) => {
    try {
      await userService.adminUpdate(userId, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
      refetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await userService.adminUpdate(userId, { role });
      toast.success('Role updated');
      refetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Permanently delete user "${name}"? Their tasks will be unassigned.`)) return;
    try {
      await userService.adminDelete(userId);
      toast.success('User deleted');
      refetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Admin Panel</h2>
        <p className="text-sm text-slate-400">Platform management and oversight</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[['users','👥 Users'],['report','📊 Report']].map(([k,l]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === k ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}>{l}</button>
        ))}
      </div>

      {/* ── Users tab ─────────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">All Users ({users.length})</h3>
            <span className="text-xs text-slate-400">
              {users.filter((u) => u.isActive).length} active
            </span>
          </div>

          {usersLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['User','Role','Status','Joined','Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((u) => (
                    <tr key={u._id} className={`hover:bg-slate-50 transition-colors ${!u.isActive ? 'opacity-60' : ''}`}>
                      {/* User info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        {u._id === currentUser?._id ? (
                          <span className="badge bg-primary-100 text-primary-700">{u.role}</span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        {u._id !== currentUser?._id && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(u._id, u.isActive)}
                              className={`text-xs px-2 py-1 rounded-lg border font-medium transition-colors ${
                                u.isActive
                                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                  : 'border-green-200 text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDelete(u._id, u.name)}
                              className="text-xs px-2 py-1 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                        {u._id === currentUser?._id && (
                          <span className="text-xs text-slate-300">You</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Report tab ────────────────────────────────────── */}
      {activeTab === 'report' && (
        <div className="space-y-5">
          {reportLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Platform stats */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Total Users',      value: report.totalUsers,      icon: '👥', color: 'indigo' },
                  { label: 'Active Users',      value: report.activeUsers,     icon: '✅', color: 'green' },
                  { label: 'Total Projects',    value: report.totalProjects,   icon: '📁', color: 'blue' },
                  { label: 'Total Tasks',       value: report.totalTasks,      icon: '📋', color: 'slate' },
                  { label: 'Completed Tasks',   value: report.completedTasks,  icon: '🎯', color: 'green' },
                  { label: 'Completion Rate',   value: `${report.completionRate || 0}%`, icon: '📈', color: 'purple' },
                ].map((s) => (
                  <div key={s.label} className="card flex items-center gap-4">
                    <div className="text-2xl">{s.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
                      <p className="text-2xl font-bold text-slate-800">{s.value ?? '—'}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top active users */}
              <div className="card">
                <h3 className="font-semibold text-slate-800 mb-4">Most Active Users</h3>
                {report.topUsers?.length === 0 ? (
                  <p className="text-sm text-slate-400">No data yet</p>
                ) : (
                  <div className="space-y-3">
                    {report.topUsers?.map((item, i) => (
                      <div key={item._id} className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-300 w-5 text-center">
                          {i + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {item.user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{item.user?.name}</p>
                          <p className="text-xs text-slate-400">{item.user?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-slate-100 rounded-full w-24 overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (item.taskCount / (report.topUsers?.[0]?.taskCount || 1)) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-600 w-10 text-right">
                            {item.taskCount}
                          </span>
                          <span className="text-xs text-slate-400">tasks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
