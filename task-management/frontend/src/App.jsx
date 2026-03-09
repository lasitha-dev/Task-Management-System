/* eslint-disable react/prop-types */

import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { buildAppUrl } from '@taskmaster/shared-ui/appLinks'
import { AppEmptyState, AppPageHeader, AppSectionCard, AppStatCard } from '@taskmaster/shared-ui/components'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar'
import NotificationsWorkspace from './components/NotificationsWorkspace'
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

function WorkspacePageLayout({ children, header }) {
  return (
    <main className="min-h-screen bg-[#111621]" style={{ marginLeft: 256 }}>
      <div className="p-8 flex flex-col gap-8">
        {header}
        {children}
      </div>
    </main>
  )
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'No deadline'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatStatusLabel(status) {
  if (status === 'in_progress') return 'In Progress'
  if (status === 'todo') return 'To Do'
  if (status === 'done') return 'Done'
  return status
}

function statusTone(status) {
  if (status === 'done') return 'success'
  if (status === 'in_progress') return 'accent'
  return 'warning'
}

function getStatusBarClass(status) {
  if (status === 'done') return 'bg-emerald-500'
  if (status === 'in_progress') return 'bg-[#144bb8]'
  return 'bg-amber-500'
}

function PriorityBadge({ priority }) {
  const styles = {
    urgent: 'bg-red-500/10 text-red-400',
    high: 'bg-amber-500/10 text-amber-400',
    medium: 'bg-blue-500/10 text-blue-400',
    low: 'bg-emerald-500/10 text-emerald-400',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${styles[priority] || styles.medium}`}>
      {priority || 'medium'}
    </span>
  )
}

function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, todo: 0, in_progress: 0, done: 0 })
  const [boards, setBoards] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    let isCancelled = false

    async function loadOverview() {
      setLoading(true)
      try {
        const [statsResponse, boardsResponse, tasksResponse, usersResponse] = await Promise.all([
          api.get('/api/tasks/stats'),
          api.get('/api/boards'),
          api.get('/api/tasks'),
          api.get('/api/tasks/users'),
        ])

        if (isCancelled) {
          return
        }

        setStats(statsResponse.data.stats || { total: 0, todo: 0, in_progress: 0, done: 0 })
        setBoards(boardsResponse.data.boards || [])
        setTasks((tasksResponse.data.tasks || []).slice(0, 5))
        setUsers(usersResponse.data.users || [])
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadOverview()

    return () => {
      isCancelled = true
    }
  }, [])

  let recentTasksContent
  if (loading) {
    recentTasksContent = (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-20 rounded-xl bg-[#202634] animate-pulse" />)}
      </div>
    )
  } else if (tasks.length === 0) {
    recentTasksContent = <AppEmptyState icon="inbox" title="No tasks yet" description="Create a board and add your first task to start tracking work." />
  } else {
    recentTasksContent = (
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task._id} className="rounded-xl border border-[#2d3544] bg-[#161b26] px-4 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <p className="text-sm font-semibold text-white truncate">{task.title}</p>
                <PriorityBadge priority={task.priority} />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span>{formatStatusLabel(task.status)}</span>
                <span className="text-slate-600">•</span>
                <span>{formatDisplayDate(task.deadline)}</span>
                {task.project ? (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>{task.project}</span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              {(task.assignees || []).length} assignee{(task.assignees || []).length === 1 ? '' : 's'}
            </div>
          </div>
        ))}
      </div>
    )
  }

  let boardOverviewContent
  if (loading) {
    boardOverviewContent = (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-16 rounded-xl bg-[#202634] animate-pulse" />)}
      </div>
    )
  } else if (boards.length === 0) {
    boardOverviewContent = <AppEmptyState icon="dashboard_customize" title="No boards yet" description="Boards you create or join will appear here." />
  } else {
    boardOverviewContent = (
      <div className="space-y-3">
        {boards.slice(0, 4).map((board) => (
          <div key={board._id} className="rounded-xl border border-[#2d3544] bg-[#161b26] px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{board.name}</p>
                <p className="text-xs text-slate-400 mt-1">{board.description || 'No description yet'}</p>
              </div>
              <span className="tm-pill tm-pill-accent">{board.sprint || 'Sprint 1'}</span>
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {(board.members || []).length} member{(board.members || []).length === 1 ? '' : 's'}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <WorkspacePageLayout
      header={
        <AppPageHeader
          title="Workspace Dashboard"
          subtitle="See the health of your boards, tasks, and team activity at a glance."
          actions={
            <Link to="/notifications" className="tm-button-secondary">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span>Open Notifications</span>
            </Link>
          }
        />
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AppStatCard label="Total Tasks" value={stats.total} meta="Across your boards" icon="task_alt" tone="accent" />
        <AppStatCard label="In Progress" value={stats.in_progress} meta="Currently active" icon="hourglass_top" tone="accent" />
        <AppStatCard label="Completed" value={stats.done} meta="Finished work" icon="done_all" tone="success" />
        <AppStatCard label="Active People" value={users.length} meta="Reachable through workspace" icon="group" tone="warning" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-6">
        <AppSectionCard className="p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-white">Recent Tasks</h3>
              <p className="text-sm text-slate-400 mt-1">Latest work items across all boards.</p>
            </div>
            <a href="/" className="text-sm font-semibold text-[#144bb8] hover:text-blue-300 transition-colors">Open Board</a>
          </div>
          {recentTasksContent}
        </AppSectionCard>

        <AppSectionCard className="p-6">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-white">Boards Overview</h3>
            <p className="text-sm text-slate-400 mt-1">Active boards and sprint ownership.</p>
          </div>
          {boardOverviewContent}
        </AppSectionCard>
      </div>
    </WorkspacePageLayout>
  )
}

function TeamSpacePage() {
  const [loading, setLoading] = useState(true)
  const [boards, setBoards] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    let isCancelled = false

    async function loadTeamSpace() {
      setLoading(true)
      try {
        const [boardsResponse, usersResponse] = await Promise.all([
          api.get('/api/boards'),
          api.get('/api/tasks/users'),
        ])

        if (isCancelled) {
          return
        }

        setBoards(boardsResponse.data.boards || [])
        setUsers(usersResponse.data.users || [])
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadTeamSpace()

    return () => {
      isCancelled = true
    }
  }, [])

  const membersById = new Map()
  boards.forEach((board) => {
    ;(board.members || []).forEach((member) => {
      const existing = membersById.get(member.id) || { ...member, boards: [] }
      existing.boards = [...existing.boards, board.name]
      membersById.set(member.id, existing)
    })
  })

  users.forEach((user) => {
    if (!membersById.has(user.id)) {
      membersById.set(user.id, { ...user, boards: [] })
    }
  })

  const members = Array.from(membersById.values())

  let directoryContent
  if (loading) {
    directoryContent = (
      <div className="p-6 space-y-3">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 rounded-xl bg-[#202634] animate-pulse" />)}
      </div>
    )
  } else if (members.length === 0) {
    directoryContent = <AppEmptyState icon="group_off" title="No team members found" description="Add collaborators to a board to see them here." />
  } else {
    directoryContent = (
      <div className="divide-y divide-[#2d3544]">
        {members.map((member, index) => (
          <div key={member.id || member.email || index} className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 bg-[#1c212c]">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-11 w-11 rounded-full bg-[#144bb8] flex items-center justify-center text-white font-bold text-sm">
                {member.name?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{member.name || 'Unknown User'}</p>
                <p className="text-xs text-slate-400 truncate">{member.email || 'No email available'}</p>
              </div>
            </div>
            <div className="min-w-0 text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Boards</p>
              <p className="text-sm text-slate-300 truncate max-w-[320px]">{member.boards.length > 0 ? member.boards.join(', ') : 'Not assigned yet'}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <WorkspacePageLayout
      header={<AppPageHeader title="Team Space" subtitle="A shared directory of workspace members and where they collaborate." />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AppStatCard label="People" value={members.length} meta="Visible to this workspace" icon="group" tone="accent" />
        <AppStatCard label="Boards" value={boards.length} meta="Shared collaboration spaces" icon="dashboard_customize" tone="warning" />
        <AppStatCard label="Assigned Members" value={members.filter((member) => member.boards.length > 0).length} meta="Already attached to a board" icon="groups_2" tone="success" />
      </div>

      <AppSectionCard className="overflow-hidden">
        <div className="px-6 py-5 border-b border-[#2d3544]">
          <h3 className="text-lg font-bold text-white">Workspace Directory</h3>
          <p className="text-sm text-slate-400 mt-1">People from your task workspace and linked user service.</p>
        </div>
        {directoryContent}
      </AppSectionCard>
    </WorkspacePageLayout>
  )
}

function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, todo: 0, in_progress: 0, done: 0 })
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    let isCancelled = false

    async function loadAnalytics() {
      setLoading(true)
      try {
        const [statsResponse, tasksResponse] = await Promise.all([
          api.get('/api/tasks/stats'),
          api.get('/api/tasks'),
        ])

        if (isCancelled) {
          return
        }

        setStats(statsResponse.data.stats || { total: 0, todo: 0, in_progress: 0, done: 0 })
        setTasks(tasksResponse.data.tasks || [])
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => {
      isCancelled = true
    }
  }, [])

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const urgentTasks = tasks.filter((task) => task.priority === 'urgent').slice(0, 5)
  const averageProgress = tasks.length > 0
    ? Math.round(tasks.reduce((total, task) => total + (Number(task.progress) || 0), 0) / tasks.length)
    : 0

  let urgentQueueContent
  if (loading) {
    urgentQueueContent = (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => <div key={item} className="h-14 rounded-xl bg-[#202634] animate-pulse" />)}
      </div>
    )
  } else if (urgentTasks.length === 0) {
    urgentQueueContent = <AppEmptyState icon="check_circle" title="No urgent tasks" description="The urgent queue is clear right now." />
  } else {
    urgentQueueContent = (
      <div className="space-y-3">
        {urgentTasks.map((task) => (
          <div key={task._id} className="rounded-xl border border-[#2d3544] bg-[#161b26] px-4 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">{task.title}</p>
              <p className="text-xs text-slate-400 mt-1">{formatStatusLabel(task.status)} • {formatDisplayDate(task.deadline)}</p>
            </div>
            <PriorityBadge priority={task.priority} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <WorkspacePageLayout
      header={<AppPageHeader title="Analytics" subtitle="Track throughput, delivery pace, and the urgent work putting pressure on the team." />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AppStatCard label="Completion Rate" value={`${completionRate}%`} meta="Done versus total tasks" icon="trending_up" tone="success" />
        <AppStatCard label="Average Progress" value={`${averageProgress}%`} meta="Across all task progress values" icon="speed" tone="accent" />
        <AppStatCard label="To Do" value={stats.todo} meta="Waiting to start" icon="pending_actions" tone="warning" />
        <AppStatCard label="Urgent Tasks" value={urgentTasks.length} meta="Highest priority queue" icon="crisis_alert" tone="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        <AppSectionCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Status Breakdown</h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((item) => <div key={item} className="h-10 rounded-xl bg-[#202634] animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {['todo', 'in_progress', 'done'].map((status) => {
                const count = stats[status] || 0
                const width = stats.total > 0 ? `${Math.max(8, Math.round((count / stats.total) * 100))}%` : '8%'
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-300 font-medium">{formatStatusLabel(status)}</span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#161b26] overflow-hidden">
                      <div className={`h-full rounded-full ${getStatusBarClass(status)}`} style={{ width }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </AppSectionCard>

        <AppSectionCard className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Urgent Queue</h3>
          {urgentQueueContent}
        </AppSectionCard>
      </div>
    </WorkspacePageLayout>
  )
}

function SettingsRedirect() {
  useEffect(() => {
    globalThis.location.replace(buildAppUrl('user', '/profile', { includeToken: false }))
  }, [])

  return (
    <WorkspacePageLayout
      header={<AppPageHeader title="Settings" subtitle="Opening your account settings in the user workspace." />}
    >
      <AppEmptyState icon="settings" title="Redirecting to settings" description="Your profile and account controls live in the shared user management experience." />
    </WorkspacePageLayout>
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
      console.error('Failed to load boards', err)
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
    if (!globalThis.confirm(`Are you sure you want to delete "${board.name}"? This action cannot be undone.`)) {
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
          <AppEmptyState
            icon="dashboard"
            title="No board selected"
            description="Create a new board to start organizing work in one shared workspace."
            action={(
              <button
                onClick={() => setBoardModalOpen(true)}
                className="tm-button-primary"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Create Your First Board</span>
              </button>
            )}
          />
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

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isReady, setIsReady] = useState(false)
  
  // Check for token in URL hash FIRST (from cross-port redirect)
  useEffect(() => {
    const hash = globalThis.location.hash;
    if (hash?.startsWith('#token=')) {
      const token = hash.substring(7); // Remove '#token='
      localStorage.setItem('token', token);
      // Clean up URL — preserve the original pathname so React Router matches correctly
      globalThis.history.replaceState(null, '', globalThis.location.pathname + globalThis.location.search);
    }
    // Mark as ready after token processing
    setIsReady(true)
  }, []);

  // Get current user from JWT token
  const currentUser = getCurrentUser()
  
  // Wait for token processing before checking auth
  if (!isReady) {
    return (
      <div className="dark min-h-screen bg-background-dark flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-blue-500 animate-spin">progress_activity</span>
      </div>
    )
  }
  
  // Redirect to login if no user (after token processing)
  if (!currentUser) {
    globalThis.location.href = buildAppUrl('user', '/login', { includeToken: false })
    return null
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#111621] text-slate-100">
        <Sidebar user={currentUser} />
        <Routes>
          <Route path="/" element={<KanbanPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsWorkspace currentUser={currentUser} />} />
          <Route path="/team" element={<TeamSpacePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsRedirect />} />
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
