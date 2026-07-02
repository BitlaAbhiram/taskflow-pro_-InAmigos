// frontend/src/pages/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/apiServices';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name:     user?.name     || '',
    email:    user?.email    || '',
    jobTitle: user?.jobTitle || '',
    avatar:   user?.avatar   || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword:     '',
    confirmPassword: '',
  });
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const setP  = (k) => (e) => setProfileForm((f)  => ({ ...f, [k]: e.target.value }));
  const setPw = (k) => (e) => setPasswordForm((f) => ({ ...f, [k]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await userService.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setSavingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile header */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{user?.name}</h2>
          <p className="text-sm text-slate-400">{user?.jobTitle || 'No job title set'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          <span className={`badge mt-1 ${user?.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[['profile','👤 Profile'],['security','🔒 Security']].map(([k,l]) => (
          <button key={k} onClick={() => setActiveTab(k)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === k ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'
            }`}>{l}</button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-5">Profile Information</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={profileForm.name} onChange={setP('name')} required />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" value={profileForm.email} onChange={setP('email')} required />
            </div>
            <div>
              <label className="label">Job Title</label>
              <input className="input" value={profileForm.jobTitle} onChange={setP('jobTitle')}
                placeholder="e.g. Product Manager, Developer…" />
            </div>
            <div>
              <label className="label">Avatar URL</label>
              <input className="input" value={profileForm.avatar} onChange={setP('avatar')}
                placeholder="https://example.com/avatar.jpg" />
              <p className="text-xs text-slate-400 mt-1">Paste a public image URL (Gravatar, etc.)</p>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-5">Change Password</h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" value={passwordForm.currentPassword}
                onChange={setPw('currentPassword')} required placeholder="Your current password" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" value={passwordForm.newPassword}
                onChange={setPw('newPassword')} required minLength={6} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className="input" value={passwordForm.confirmPassword}
                onChange={setPw('confirmPassword')} required placeholder="Repeat new password" />
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary" disabled={savingPassword}>
                {savingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </form>

          {/* Security tips */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-xs font-semibold text-amber-700 mb-2">🔐 Security tips</p>
            <ul className="text-xs text-amber-600 space-y-1">
              <li>• Use at least 12 characters with a mix of letters, numbers, and symbols</li>
              <li>• Don't reuse passwords from other services</li>
              <li>• Log out of shared or public devices when done</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
