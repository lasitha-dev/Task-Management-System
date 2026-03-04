import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axiosConfig';

const avatarColors = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-teal-500',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('User');
  const [password, setPassword] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/');
      setUsers(data.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setModalLoading(true);
    try {
      await API.post('/register', { name, email, password, role });
      setShowAddModal(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('User');
      fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.msg ||
          'Failed to add user'
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/${id}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openModal = () => {
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('User');
    setShowPassword(false);
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
  };

  // Derived data
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;
  const regularCount = totalUsers - adminCount;

  const filters = ['All', 'Active', 'Inactive', 'Admin'];

  const filteredUsers = users
    .filter((u) => {
      if (activeFilter === 'Admin') return u.role === 'Admin';
      if (activeFilter === 'Active') return true;
      if (activeFilter === 'Inactive') return false;
      return true;
    })
    .filter((u) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    });

  return (
    <div className="flex h-screen overflow-hidden bg-[#111621]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#161b26] border-r border-[#2d3544] flex-col hidden lg:flex">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#2d3544]">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-[#144bb8] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">task_alt</span>
            </div>
            <h1 className="text-white text-lg font-bold tracking-tight">TaskMaster</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
          {/* User Avatar Section */}
          <div className="flex items-center gap-3 px-2">
            <div className="size-10 rounded-full bg-[#144bb8] flex items-center justify-center text-white font-bold text-sm border border-[#2d3544]">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{user?.name || 'Admin User'}</span>
              <span className="text-xs text-slate-400">{user?.email || 'admin@taskmaster.com'}</span>
            </div>
          </div>

          {/* Main Nav */}
          <nav className="flex flex-col gap-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1c212c] hover:text-white transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#144bb8] transition-colors">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1c212c] hover:text-white transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#144bb8] transition-colors">view_kanban</span>
              <span className="text-sm font-medium">Kanban Board</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1c212c] hover:text-white transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#144bb8] transition-colors">notifications</span>
              <span className="text-sm font-medium">Notifications</span>
              <span className="ml-auto bg-[#144bb8] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1c212c] hover:text-white transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#144bb8] transition-colors">pie_chart</span>
              <span className="text-sm font-medium">Analytics</span>
            </a>
          </nav>

          {/* Administration Section */}
          <div className="h-px bg-[#2d3544] my-1"></div>
          <nav className="flex flex-col gap-1">
            <div className="px-3 py-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</span>
            </div>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#144bb8]/10 text-[#144bb8] transition-colors">
                <span className="material-symbols-outlined">group</span>
                <span className="text-sm font-medium">User Monitoring</span>
              </a>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1c212c] hover:text-white transition-colors group">
                <span className="material-symbols-outlined group-hover:text-[#144bb8] transition-colors">settings</span>
                <span className="text-sm font-medium">Settings</span>
              </a>
            </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-[#2d3544]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1c212c] border border-[#2d3544] hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex lg:hidden items-center justify-between px-4 bg-[#161b26] border-b border-[#2d3544]">
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-white font-bold">TaskMaster</h1>
          </div>
          <div className="size-8 rounded-full bg-slate-700"></div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#111621] p-4 md:p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">User Monitoring</h2>
              <p className="text-slate-400 text-base mt-1">
                Manage access, roles, and track activity across the microservices ecosystem.
              </p>
            </div>
            <button
              onClick={openModal}
              className="bg-[#144bb8] hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-[#144bb8]/25"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Add New User
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Users */}
            <div className="bg-[#1c212c] p-5 rounded-xl border border-[#2d3544] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                  <span className="material-symbols-outlined">group</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</span>
                <span className="text-xs text-emerald-500 font-medium">+12% this month</span>
              </div>
            </div>

            {/* Active Now */}
            <div className="bg-[#1c212c] p-5 rounded-xl border border-[#2d3544] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">Active Now</h3>
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                  <span className="material-symbols-outlined">wifi</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{adminCount}</span>
                <span className="text-xs text-slate-500">Users online</span>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-[#1c212c] p-5 rounded-xl border border-[#2d3544] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 text-sm font-medium">Pending Approvals</h3>
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <span className="material-symbols-outlined">pending</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{regularCount}</span>
                <span className="text-xs text-amber-500 font-medium">Needs attention</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Search Bar + Filter Tabs */}
          <div className="bg-[#1c212c] p-4 rounded-t-xl border border-[#2d3544] border-b-0 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-xl">search</span>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-[#161b26] border border-[#2d3544] rounded-lg leading-5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#144bb8] focus:border-[#144bb8] sm:text-sm transition-shadow"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-[#161b26] rounded-lg w-full md:w-auto">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`flex-1 md:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                    activeFilter === f
                      ? 'bg-[#144bb8] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-[#1c212c] rounded-b-xl border border-[#2d3544] overflow-hidden shadow-sm -mt-8">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2d3544] bg-[#161b26]">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                    User ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3544]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-[#161b26]/50 transition-colors group"
                    >
                      {/* User ID */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-400 font-mono">
                          {u._id?.slice(-8) || '---'}
                        </span>
                      </td>

                      {/* User (avatar + name + email) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`h-10 w-10 flex-shrink-0 rounded-full ${getAvatarColor(u.name)} flex items-center justify-center text-white font-bold text-sm`}
                          >
                            {getInitials(u.name)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{u.name}</div>
                            <div className="text-sm text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        {u.role === 'Admin' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/20">
                            <span className="size-1.5 rounded-full bg-purple-500"></span>
                            Admin
                          </span>
                        ) : u.role === 'Manager' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                            <span className="size-1.5 rounded-full bg-blue-500"></span>
                            Manager
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400 border border-green-500/20">
                            <span className="size-1.5 rounded-full bg-green-500"></span>
                            User
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                          <span className="size-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="text-slate-400 hover:text-[#144bb8] transition-colors inline-flex items-center gap-1"
                        >
                          <span className="hidden sm:inline text-xs uppercase font-semibold">View Activity</span>
                          <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            <div className="bg-[#1c212c] px-4 py-3 flex items-center justify-between border-t border-[#2d3544] sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    Showing <span className="font-medium text-white">1</span> to{' '}
                    <span className="font-medium text-white">
                      {Math.min(filteredUsers.length, 5)}
                    </span>{' '}
                    of <span className="font-medium text-white">{filteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#2d3544] bg-[#161b26] text-sm font-medium text-slate-400 hover:bg-[#1c212c] transition-colors">
                      <span className="sr-only">Previous</span>
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                    </button>
                    <button aria-current="page" className="relative z-10 inline-flex items-center px-4 py-2 border border-[#144bb8] bg-[#144bb8]/10 text-sm font-medium text-[#144bb8]">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-[#2d3544] bg-[#161b26] text-sm font-medium text-slate-400 hover:bg-[#1c212c] transition-colors">
                      2
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#2d3544] bg-[#161b26] text-sm font-medium text-slate-400 hover:bg-[#1c212c] transition-colors">
                      <span className="sr-only">Next</span>
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-[#1c212c] w-full max-w-md rounded-xl border border-[#2d3544] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#2d3544] flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Add New User</h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="block w-full px-3 py-2 bg-[#161b26] border border-[#2d3544] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#144bb8]/50 focus:border-[#144bb8] sm:text-sm transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="block w-full px-3 py-2 bg-[#161b26] border border-[#2d3544] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#144bb8]/50 focus:border-[#144bb8] sm:text-sm transition-all"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-3 py-2 bg-[#161b26] border border-[#2d3544] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#144bb8]/50 focus:border-[#144bb8] sm:text-sm transition-all"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Initial Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="block w-full px-3 py-2 bg-[#161b26] border border-[#2d3544] rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#144bb8]/50 focus:border-[#144bb8] sm:text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-[#161b26] border-t border-[#2d3544] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={modalLoading}
                onClick={handleAddUser}
                className="bg-[#144bb8] hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-[#144bb8]/25 disabled:opacity-50"
              >
                {modalLoading ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
