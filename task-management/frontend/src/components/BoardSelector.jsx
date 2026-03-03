import React, { useState } from 'react'

export default function BoardSelector({ boards, selectedBoard, onSelectBoard, onCreateBoard }) {
  const [isOpen, setIsOpen] = useState(false)

  const currentBoardName = selectedBoard 
    ? boards.find(b => b._id === selectedBoard)?.name || 'Select Board'
    : 'Select Board'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-lg hover:border-primary dark:hover:border-primary transition-colors"
      >
        <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-text-dark">
          dashboard
        </span>
        <span className="font-semibold text-slate-800 dark:text-text-dark max-w-[200px] truncate">
          {currentBoardName}
        </span>
        <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-xl z-50 py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {/* Create new board button */}
            <button
              onClick={() => {
                setIsOpen(false)
                onCreateBoard()
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-surface-highlight transition-colors text-left border-b border-slate-100 dark:border-border-dark mb-2"
            >
              <span className="material-symbols-outlined text-[20px] text-primary">
                add_circle
              </span>
              <span className="font-semibold text-primary">
                Create New Board
              </span>
            </button>

            {/* Board list */}
            {boards.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                No boards yet. Create your first board!
              </div>
            ) : (
              <div className="space-y-1">
                {boards.map((board) => (
                  <button
                    key={board._id}
                    onClick={() => {
                      onSelectBoard(board._id)
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-surface-highlight transition-colors text-left ${
                      selectedBoard === board._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-primary' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-slate-600 dark:text-text-dark mt-0.5">
                      {selectedBoard === board._id ? 'check_circle' : 'dashboard'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 dark:text-text-dark truncate">
                        {board.name}
                      </div>
                      {board.description && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                          {board.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                        <span className="material-symbols-outlined text-[14px]">group</span>
                        <span>{board.members?.length || 0} members</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
