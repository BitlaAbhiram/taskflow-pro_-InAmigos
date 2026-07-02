// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white text-2xl font-bold mb-4">
            TF
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1">Sign in to TaskFlow Pro</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={set('email')}
                placeholder="you@example.com" required autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={form.password} onChange={set('password')}
                placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Demo accounts (password: password123)
            </p>
            <div className="space-y-1">
              {[
                ['admin@taskflow.pro', '👑 Admin'],
                ['alice@taskflow.pro', '📋 Product Manager'],
                ['bob@taskflow.pro', '💻 Developer'],
                ['carol@taskflow.pro', '🎨 Designer'],
              ].map(([email, label]) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => fillDemo(email)}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <span className="mr-1">{label}</span>
                  <span className="text-slate-400">{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
