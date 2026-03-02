import React from 'react'

const TEAM_AVATARS = [
  'https://ui-avatars.com/api/?name=Alex+Morgan&background=144bb8&color=fff',
  'https://ui-avatars.com/api/?name=Jamie+D&background=8b5cf6&color=fff',
  'https://ui-avatars.com/api/?name=Sam+K&background=0891b2&color=fff',
]

export default function Header({ projectName, sprint, onNewTask }) {
  return (
    <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-surface-highlight/50 z-40 shrink-0">
      <div className="flex items-center gap-5">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {projectName || 'Microservices Migration'}
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20">
            {sprint || 'Sprint 4'} Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Team avatars */}
        <div className="flex items-center -space-x-3">
          {TEAM_AVATARS.map((src, i) => (
            <img
              key={i}
              alt="Team member"
              className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-surface-dark border border-slate-300 dark:border-transparent"
              src={src}
            />
          ))}
          <div className="h-8 w-8 rounded-full bg-surface-highlight flex items-center justify-center ring-2 ring-white dark:ring-surface-dark text-xs font-bold text-white">
            +3
          </div>
        </div>

        {/* New Task button */}
        <button
          onClick={onNewTask}
          className="bg-primary hover:bg-blue-700 text-white text-sm font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Task</span>
        </button>
      </div>
    </header>
  )
}
