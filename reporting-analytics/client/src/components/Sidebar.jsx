import React, { useState } from 'react';

export const Sidebar = ({ collapsed = false, onToggle }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tasks', label: 'Task Board', icon: '📋' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'team', label: 'Team Space', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈', active: true }
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-dark-surface border-r border-dark-border h-screen fixed left-0 top-0">
        {/* Logo */}
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span>
            <span>TaskMaster</span>
          </h2>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              AR
            </div>
            <div className="flex-1">
              <h4 className="text-white font-semibold text-sm">Alex Rivera</h4>
              <p className="text-dark-border text-xs">Project Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                item.active
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-dark-border hover:bg-dark-bg hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-dark-border p-3 space-y-2">
          <a
            href="#settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-border hover:bg-dark-bg hover:text-white transition"
          >
            <span className="text-lg">⚙️</span>
            <span className="font-medium">Settings</span>
          </a>
          <a
            href="#logout"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-dark-border hover:bg-dark-bg hover:text-white transition"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium">Logout</span>
          </a>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-dark-surface border-t border-dark-border">
        <nav className="flex justify-around">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`flex flex-col items-center py-3 px-4 flex-1 transition ${
                item.active ? 'text-primary' : 'text-dark-border hover:text-white'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Spacer for mobile */}
      <div className="md:hidden h-20"></div>
    </>
  );
};

export default Sidebar;
