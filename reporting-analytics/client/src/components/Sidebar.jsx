import React from 'react';
import { LayoutDashboard, CheckSquare, Bell, Users, BarChart2, Settings, LogOut } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-red-400' },
    { id: 'tasks', label: 'Task Board', icon: CheckSquare, color: 'text-gray-300' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-yellow-400' },
    { id: 'team', label: 'Team Space', icon: Users, color: 'text-purple-400' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, color: 'text-white', active: true }
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-400' },
    { id: 'logout', label: 'Logout', icon: LogOut, color: 'text-blue-400' }
  ];

  return (
    <>
      {/* Desktop Sidebar - Fixed left */}
      <div className="hidden lg:flex flex-col w-60 bg-slate-900 h-screen fixed left-0 top-0 border-r border-slate-700">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">□</div>
            <h2 className="text-lg font-bold text-white">TaskMaster</h2>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
              <span className="text-lg">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-sm">Alex Rivera</h4>
              <p className="text-slate-400 text-xs">Project Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-0 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex items-center gap-3 mx-3 px-4 py-3 rounded-lg transition ${
                  item.active
                    ? 'bg-blue-500 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={18} className={item.active ? 'text-white' : item.color} />
                <span className="font-medium text-sm">{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="border-t border-slate-700 p-3 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition"
              >
                <Icon size={18} className={item.color} />
                <span className="font-medium text-sm">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-slate-900 border-t border-slate-700 z-50">
        <nav className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex flex-col items-center py-3 px-4 flex-1 transition ${
                  item.active ? 'text-blue-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon size={20} className={item.active ? 'text-blue-500' : item.color} />
                <span className="text-xs mt-1 font-medium">{item.label.split(' ')[0]}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Spacer for mobile */}
      <div className="lg:hidden h-20"></div>
    </>
  );
};

export default Sidebar;
