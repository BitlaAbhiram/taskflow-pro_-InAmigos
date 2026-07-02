// frontend/src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 text-white text-2xl font-bold mb-4">
            TF
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 mt-1">Start managing work smarter</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={set('name')}
                placeholder="Your name" required autoFocus />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={set('email')}
                placeholder="you@example.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" value={form.password} onChange={set('password')}
                placeholder="Min. 6 characters" required minLength={6} />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
