import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const navItems = [
  { icon: 'grid_view', label: 'Dashboard', to: '/dashboard' },
  { icon: 'layers', label: 'Task Board', to: '/' },
  { icon: 'notifications', label: 'Notifications', to: '/notifications' },
  { icon: 'diversity_3', label: 'Team Space', to: '/team' },
  { icon: 'insights', label: 'Analytics', to: '/analytics' },
]

export default function Sidebar({ user }) {
  const navigate = useNavigate()

  function handleSignOut() {
    localStorage.removeItem('token')
    sessionStorage.clear()
    // Add logout flag so user-management knows to clear its localStorage
    window.location.href = 'http://127.0.0.1:3000/login?logout=true'
  }
  return (
    <aside className="w-[260px] fixed top-0 left-0 bottom-0 z-50 bg-surface-dark border-r border-surface-highlight flex flex-col justify-between py-6 px-4">
      {/* Top section */}
      <div className="flex flex-col gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl">account_tree</span>
          </div>
          <h1 className="font-extrabold text-lg tracking-tight text-white uppercase">MERN Core</h1>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 p-3 bg-surface-highlight/30 rounded-xl border border-surface-highlight/50">
          <div
            className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 ring-2 ring-primary/40 flex-shrink-0"
            style={{
              backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=144bb8&color=fff")`,
            }}
          />
          <div className="flex flex-col min-w-0">
            <p className="text-white text-sm font-bold truncate">{user?.name || 'Guest'}</p>
            <p className="text-slate-400 text-xs font-medium truncate">{user?.role || 'User'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-400 hover:text-white hover:bg-surface-highlight/50'
                }`
              }
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 border-t border-surface-highlight/50 pt-6">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white rounded-lg transition-colors text-sm font-semibold"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
          <span>Settings</span>
        </NavLink>
        <button
          className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-400 rounded-lg transition-colors text-sm font-semibold w-full text-left"
          onClick={handleSignOut}
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
