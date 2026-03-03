import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import KanbanBoard from './components/KanbanBoard'
import CreateTaskModal from './components/CreateTaskModal'
import api from './api/axios'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [toast, setToast] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  function openCreate() {
    setEditingTask(null)
    setModalOpen(true)
  }

  function openEdit(task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  async function handleSubmit(formData) {
    try {
      if (editingTask) {
        await api.put(`/api/tasks/${editingTask._id}`, formData)
        showToast('Task updated successfully')
      } else {
        await api.post('/api/tasks', formData)
        showToast('Task created successfully')
      }
      setRefreshKey((k) => k + 1)
    } catch (err) {
      showToast(err?.response?.data?.message || 'Something went wrong', 'error')
      throw err // keep modal open
    }
  }

  return (
    <main className="flex flex-col h-screen overflow-hidden" style={{ marginLeft: 260 }}>
      <Header
        projectName="Microservices Migration"
        sprint="Sprint 4"
        onNewTask={openCreate}
      />
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 bg-slate-50 dark:bg-background-dark custom-scrollbar">
        <KanbanBoard key={refreshKey} onNewTask={openCreate} onEdit={openEdit} />
      </div>

      <CreateTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingTask}
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
  const mockUser = { name: 'Alex Morgan', role: 'DevOps Lead' }

  return (
    <BrowserRouter>
      <div className="dark min-h-screen bg-background-dark text-slate-100">
        <Sidebar user={mockUser} />
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
