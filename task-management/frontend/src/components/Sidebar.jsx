/* eslint-disable react/prop-types */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { buildAppUrl } from '@taskmaster/shared-ui/appLinks'
import {
  AppSidebarBody,
  AppSidebarBrand,
  AppSidebarDivider,
  AppSidebarProfile,
  AppSidebarSectionLabel,
  AppSidebarShell,
} from '@taskmaster/shared-ui/components'

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
    <AppSidebarShell
      className="fixed top-0 left-0 bottom-0 z-50"
      footer={
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1c212c] border border-[#2d3544] hover:border-slate-500 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
          onClick={handleSignOut}
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          <span>Logout</span>
        </button>
      }
    >
      <AppSidebarBrand />
      <AppSidebarBody>
        <AppSidebarProfile
          name={user?.name || 'Guest User'}
          subtitle={user?.role || 'Team workspace'}
          avatarName={user?.name || 'User'}
        />

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

        <AppSidebarDivider />
        <AppSidebarSectionLabel>Workspace</AppSidebarSectionLabel>

        <div className="flex flex-col gap-1">
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
      </AppSidebarBody>
    </AppSidebarShell>
  )
}
