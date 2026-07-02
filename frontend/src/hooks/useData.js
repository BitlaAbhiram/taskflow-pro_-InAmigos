// frontend/src/hooks/useData.js
// ──────────────────────────────────────────────────────────
// Reusable data-fetching hooks. Each encapsulates loading,
// error, and data state so pages stay lean.
// ──────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import {
  taskService,
  projectService,
  notificationService,
  analyticsService,
} from '../services/apiServices';
import toast from 'react-hot-toast';

// ─── Generic fetch hook ───────────────────────────────────
export const useFetch = (fetchFn, deps = []) => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFn();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

// ─── Projects ─────────────────────────────────────────────
export const useProjects = () => {
  const { data, loading, error, refetch } = useFetch(() => projectService.getAll());
  return { projects: data?.projects || [], loading, error, refetch };
};

export const useProject = (id) => {
  const { data, loading, error, refetch } = useFetch(() => projectService.getById(id), [id]);
  return { project: data?.project, loading, error, refetch };
};

// ─── Tasks ────────────────────────────────────────────────
export const useTasks = (params = {}) => {
  const paramStr = JSON.stringify(params);
  const { data, loading, error, refetch } = useFetch(
    () => taskService.getAll(params),
    [paramStr]
  );
  return { tasks: data?.tasks || [], loading, error, refetch };
};

// ─── Notifications ────────────────────────────────────────
export const useNotifications = () => {
  const { data, loading, error, refetch } = useFetch(() => notificationService.getAll());
  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    loading,
    error,
    refetch,
  };
};

// ─── Dashboard analytics ──────────────────────────────────
export const useDashboard = () => {
  const { data, loading, error, refetch } = useFetch(() => analyticsService.dashboard());
  return {
    stats: data?.stats,
    recentTasks: data?.recentTasks || [],
    myTasks: data?.myTasks || [],
    loading,
    error,
    refetch,
  };
};

// ─── Productivity chart ───────────────────────────────────
export const useProductivity = (days = 30) => {
  const { data, loading, error, refetch } = useFetch(
    () => analyticsService.productivity(days),
    [days]
  );
  return { completed: data?.completed || [], created: data?.created || [], loading, error, refetch };
};

// ─── Users list ───────────────────────────────────────────
export const useUsers = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../services/apiServices').then(({ userService }) => {
      userService.getAll()
        .then(({ data }) => setUsers(data.users))
        .catch(() => toast.error('Failed to load team members'))
        .finally(() => setLoading(false));
    });
  }, []);

  return { users, loading };
};
