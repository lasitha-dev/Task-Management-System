import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import KanbanBoard from './components/KanbanBoard'
import CreateTaskModal from './components/CreateTaskModal'
import CreateBoardModal from './components/CreateBoardModal'
import api from './api/axios'
import { getCurrentUser } from './utils/auth'

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  const bg = type === 'error' ? 'bg-red-500' : 'bg-green-600'
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl ${bg}`}>
      <span className="material-symbols-outlined text-[18px]">
        {type === 'error' ? 'error' : 'check_circle'}
      </span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
        <span className="material-symbols-outlined text-[16px]">close</span>
      </button>
    </div>
  )
}

// ─── Main Kanban page ─────────────────────────────────────────────────────────
function KanbanPage() {
  const [modalOpen, setModalOpen]     = useState(false)
  const [editingTask, setEditingTask]   = useState(null)
  const [defaultStatus, setDefaultStatus] = useState('todo')
  const [toast, setToast]             = useState(null)
  const [refreshKey, setRefreshKey]   = useState(0)
  
  // Board management
  const [boards, setBoards] = useState([])
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [boardModalOpen, setBoardModalOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState(null)
  const [loadingBoards, setLoadingBoards] = useState(true)
  
  // Get current user from JWT token - use state to allow refresh
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  const currentUserId = currentUser?.id || null

  // Refresh user data on mount and when token changes
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setCurrentUser(getCurrentUser())
    }
  }, [])

  // Fetch boards on mount
  useEffect(() => {
    fetchBoards()
  }, [])

  async function fetchBoards() {
    try {
      const { data } = await api.get('/api/boards')
      const boardList = data.boards || []
      setBoards(boardList)
      
      // Auto-select first board if available
      if (boardList.length > 0 && !selectedBoard) {
        setSelectedBoard(boardList[0]._id)
      } else if (boardList.length === 0) {
        // No boards exist, prompt user to create one
        setSelectedBoard(null)
      }
    } catch (err) {
      showToast('Failed to load boards', 'error')
    } finally {
      setLoadingBoards(false)
    }
  }

  async function handleCreateBoard(boardData) {
    try {
      if (editingBoard) {
        // Update existing board
        const { data } = await api.put(`/api/boards/${editingBoard._id}`, boardData)
        const updatedBoard = data.board
        setBoards(boards.map(b => b._id === updatedBoard._id ? updatedBoard : b))
        showToast('Board updated successfully')
      } else {
        // Create new board
        const { data } = await api.post('/api/boards', boardData)
        const newBoard = data.board
        setBoards([newBoard, ...boards])
        setSelectedBoard(newBoard._id)
        showToast('Board created successfully')
      }
      setRefreshKey((k) => k + 1) // Refresh tasks
      setEditingBoard(null)
    } catch (err) {
      showToast(err?.response?.data?.message || `Failed to ${editingBoard ? 'update' : 'create'} board`, 'error')
      throw err
    }
  }

  function handleEditBoard(board) {
    setEditingBoard(board)
    setBoardModalOpen(true)
  }

  async function handleDeleteBoard(board) {
    if (!window.confirm(`Are you sure you want to delete "${board.name}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await api.delete(`/api/boards/${board._id}`)
      const updatedBoards = boards.filter(b => b._id !== board._id)
      setBoards(updatedBoards)
      
      // If deleted board was selected, select first available board or null
      if (selectedBoard === board._id) {
        setSelectedBoard(updatedBoards.length > 0 ? updatedBoards[0]._id : null)
      }
      
      showToast('Board deleted successfully')
      setRefreshKey((k) => k + 1)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete board', 'error')
    }
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  function openCreate(status = 'todo') {
    if (!selectedBoard) {
      showToast('Please create or select a board first', 'error')
      return
    }
    setEditingTask(null)
    setDefaultStatus(status)
    setModalOpen(true)
  }

  function openEdit(task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  async function handleSubmit(formData) {
    try {
      // Add board to task data
      const taskData = { ...formData, board: selectedBoard }
      
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask._id}`, taskData)
        showToast('Task updated successfully')
      } else {
        await api.post('/api/tasks', taskData)
        showToast('Task created successfully')
      }
      setRefreshKey((k) => k + 1)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong', 'error')
      throw err // keep modal open
    }
  }

  const currentBoard = boards.find(b => b._id === selectedBoard)

  return (
    <main className="flex flex-col h-screen overflow-hidden" style={{ marginLeft: 260 }}>
      <Header
        boards={boards}
        selectedBoard={selectedBoard}
        onSelectBoard={setSelectedBoard}
        onCreateBoard={() => {
          setEditingBoard(null)
          setBoardModalOpen(true)
        }}
        onEditBoard={handleEditBoard}
        onDeleteBoard={handleDeleteBoard}
        currentUserId={currentUserId}
        boardName={currentBoard?.name || 'No Board Selected'}
        sprint={currentBoard?.sprint || 'Sprint 1'}
        boardMembers={currentBoard?.members || []}
        onNewTask={openCreate}
        loadingBoards={loadingBoards}
      />
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-slate-50 dark:bg-background-dark custom-scrollbar">
        {selectedBoard ? (
          <KanbanBoard 
            key={`${refreshKey}-${selectedBoard}`} 
            boardId={selectedBoard}
            onNewTask={openCreate} 
            onEdit={openEdit} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <span className="material-symbols-outlined text-6xl text-slate-300">dashboard</span>
            <p className="text-xl font-semibold">No board selected</p>
            <p className="text-sm">Create a new board to get started</p>
            <button
              onClick={() => setBoardModalOpen(true)}
              className="mt-4 px-6 py-3 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Create Your First Board
            </button>
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingTask}
        defaultStatus={defaultStatus}
        boardMembers={currentBoard?.members || []}
      />

      <CreateBoardModal
        isOpen={boardModalOpen}
        onClose={() => {
          setBoardModalOpen(false)
          setEditingBoard(null)
        }}
        onSubmit={handleCreateBoard}
        initialData={editingBoard}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </main>
  )
}

// ─── Placeholder pages ────────────────────────────────────────────────────────
function PlaceholderPage({ title, icon }) {
  return (
    <main className="flex flex-col items-center justify-center h-screen" style={{ marginLeft: 260 }}>
      <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-surface-highlight mb-4">{icon}</span>
      <h2 className="text-2xl font-bold text-slate-400 dark:text-slate-500">{title}</h2>
      <p className="text-slate-400 text-sm mt-2">Coming soon</p>
    </main>
  )
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  // Check for token in URL hash first (from cross-port redirect)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#token=')) {
      const token = hash.substring(7); // Remove '#token='
      localStorage.setItem('token', token);
      // Clean up URL
      window.history.replaceState(null, '', '/');
    }
  }, []);

  // Get current user from JWT token
  const currentUser = getCurrentUser()
  
  // Redirect to login if no user
  if (!currentUser) {
    window.location.href = 'http://127.0.0.1:3000'
    return null
  }

  return (
    <BrowserRouter>
      <div className="dark min-h-screen bg-background-dark text-slate-100">
        <Sidebar user={currentUser} />
        <Routes>
          <Route path="/" element={<KanbanPage />} />
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" icon="grid_view" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" icon="notifications" />} />
          <Route path="/team" element={<PlaceholderPage title="Team Space" icon="diversity_3" />} />
          <Route path="/analytics" element={<PlaceholderPage title="Analytics" icon="insights" />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" icon="settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </div>
    </BrowserRouter>
  )
}
