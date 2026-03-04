import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosConfig';

export default function ProfilePage() {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await API.put(`/${user._id}`, form);
      const updatedUser = { ...user, ...data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#111621] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161b26] border-r border-[#2d3544] flex flex-col">
        <div className="p-6 border-b border-[#2d3544]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#144bb8] text-2xl">task_alt</span>
            <span className="text-white text-xl font-bold">TaskMaster</span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-3">Account</p>
          <nav className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#144bb8]/10 text-[#144bb8] rounded-lg cursor-pointer">
              <span className="material-symbols-outlined text-xl">person</span>
              <span className="text-sm font-medium">My Profile</span>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-[#2d3544]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer transition w-full"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Nav */}
        <header className="bg-[#161b26] border-b border-[#2d3544] px-8 py-4 flex items-center justify-between">
          <span className="text-white font-semibold">My Profile</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-[#64748b] text-xs">{user?.email}</p>
            </div>
            <div className="w-9 h-9 bg-[#144bb8] rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          <div className="max-w-2xl">
            <h1 className="text-white text-2xl font-bold mb-2">Profile Settings</h1>
            <p className="text-[#94a3b8] text-sm mb-8">Manage your account information.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm">{success}</div>
            )}

            {/* Profile Card */}
            <div className="bg-[#1c212c] border border-[#2d3544] rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#144bb8]/20 rounded-full flex items-center justify-center text-[#144bb8] text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-white text-lg font-semibold">{user?.name}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    user?.role === 'Admin'
                      ? 'bg-[#144bb8]/10 text-[#144bb8]'
                      : 'bg-[#94a3b8]/10 text-[#94a3b8]'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-1">Full Name</label>
                    <p className="text-white text-sm">{user?.name}</p>
                  </div>
                  <div>
                    <label className="block text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-1">Email Address</label>
                    <p className="text-white text-sm">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-[#64748b] text-xs font-semibold uppercase tracking-wider mb-1">Member Since</label>
                    <p className="text-white text-sm">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-[#144bb8] hover:bg-[#113d96] text-white font-medium px-5 py-2.5 rounded-lg transition flex items-center gap-2 mt-4"
                  >
                    <span className="material-symbols-outlined text-xl">edit</span>
                    Edit Profile
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-[#94a3b8] text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full bg-[#161b26] border border-[#2d3544] rounded-lg px-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#144bb8] focus:ring-1 focus:ring-[#144bb8] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[#94a3b8] text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      className="w-full bg-[#161b26] border border-[#2d3544] rounded-lg px-4 py-3 text-white placeholder-[#64748b] focus:outline-none focus:border-[#144bb8] focus:ring-1 focus:ring-[#144bb8] transition"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setEditing(false); setForm({ name: user?.name || '', email: user?.email || '' }); }}
                      className="flex-1 border border-[#2d3544] text-[#94a3b8] hover:text-white hover:border-[#475569] font-medium py-2.5 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-[#144bb8] hover:bg-[#113d96] text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
