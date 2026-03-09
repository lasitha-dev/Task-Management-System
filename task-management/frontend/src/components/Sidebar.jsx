import React from 'react'
import { NavLink } from 'react-router-dom'
import { buildAppUrl } from '@taskmaster/shared-ui/appLinks'

const navItems = [
  { icon: 'grid_view', label: 'Dashboard', to: '/dashboard' },
  { icon: 'layers', label: 'Task Board', to: '/' },
  { icon: 'notifications', label: 'Notifications', to: '/notifications' },
  { icon: 'diversity_3', label: 'Team Space', to: '/team' },
  { icon: 'insights', label: 'Analytics', to: '/analytics' },
]

export default function Sidebar({ user }) {
  function handleSignOut() {
    localStorage.removeItem('token')
    sessionStorage.clear()
    globalThis.location.href = buildAppUrl('user', '/login', {
      includeToken: false,
      query: { logout: 'true' },
    })
  }
  return (
    <aside className="w-64 fixed top-0 left-0 bottom-0 z-50 bg-[#161b26] border-r border-[#2d3544] flex flex-col justify-between">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-[#2d3544]">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-[#144bb8] flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">task_alt</span>
            </div>
            <h1 className="text-white text-lg font-bold tracking-tight">TaskMaster</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <div
              className="size-10 rounded-full bg-[#144bb8] flex items-center justify-center text-white font-bold text-sm border border-[#2d3544]"
              style={{
                backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=144bb8&color=fff")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role || 'Team workspace'}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                    isActive
                      ? 'bg-[#144bb8]/10 text-[#144bb8]'
                      : 'text-slate-400 hover:bg-[#1c212c] hover:text-white'
                  }`
                }
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="h-px bg-[#2d3544] my-1" />
          <div className="px-3 py-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspace</span>
          </div>
          <a
            href={buildAppUrl('notifications')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1c212c] hover:text-white transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span>Notifications Center</span>
          </a>
          <a
            href={buildAppUrl('user', '/admin', { includeToken: false })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1c212c] hover:text-white transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">group</span>
            <span>User Monitoring</span>
          </a>
          <a
            href={buildAppUrl('user', '/profile', { includeToken: false })}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-[#1c212c] hover:text-white transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span>Profile</span>
          </a>
        </div>
      </div>

      <div className="p-4 border-t border-[#2d3544]">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1c212c] border border-[#2d3544] hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
          onClick={handleSignOut}
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
