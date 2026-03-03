import React, { useState, useEffect } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import KanbanColumn from './KanbanColumn'
import TaskDetailModal from './TaskDetailModal'
import api from '../api/axios'

const COLUMNS = ['todo', 'in_progress', 'done']

function groupByStatus(tasks) {
  return COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col)
    return acc
  }, {})
}

export default function KanbanBoard({ onNewTask, onEdit }) {
  const [tasks, setTasks]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [detailTaskId, setDetailTaskId] = useState(null)

  async function fetchTasks() {
    try {
      const { data } = await api.get('/api/tasks')
      // Support { tasks: [...] } or plain array
      setTasks(Array.isArray(data) ? data : data.tasks || [])
    } catch (err) {
      setError('Failed to load tasks. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  async function handleDelete(taskId) {
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/api/tasks/${taskId}`)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
    } catch {
      alert('Failed to delete task.')
    }
  }

  async function handleDragEnd(result) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    )

    try {
      await api.patch(`/api/tasks/${draggableId}`, { status: newStatus })
    } catch {
      // Revert on failure
      fetchTasks()
      alert('Failed to update task status.')
    }
  }

  function handleTaskUpdated(updatedTask) {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)))
  }

  const grouped = groupByStatus(tasks)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <span className="material-symbols-outlined text-4xl animate-spin mr-3">progress_activity</span>
        <span className="text-lg font-semibold">Loading tasks...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
        <span className="material-symbols-outlined text-5xl text-red-400">error</span>
        <p className="text-sm font-semibold text-red-400">{error}</p>
        <button
          onClick={fetchTasks}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-8 h-full min-w-max pb-4">
          {COLUMNS.map((colId) => (
            <KanbanColumn
              key={colId}
              columnId={colId}
              tasks={grouped[colId]}
              onEdit={onEdit}
              onDelete={handleDelete}
              onAddTask={onNewTask}
              onViewDetail={(task) => setDetailTaskId(task._id)}
            />
          ))}

          {/* Add new column placeholder */}
          <div className="w-[350px] shrink-0 border-2 border-dashed border-slate-200 dark:border-surface-highlight/30 rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-slate-400 dark:text-slate-600 hover:text-primary dark:hover:text-primary hover:border-primary/50 transition-all cursor-pointer group">
            <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_circle</span>
            <p className="text-sm font-bold uppercase tracking-widest">Add New Column</p>
          </div>
        </div>
      </DragDropContext>

      <TaskDetailModal
        taskId={detailTaskId}
        isOpen={Boolean(detailTaskId)}
        onClose={() => setDetailTaskId(null)}
        onTaskUpdated={handleTaskUpdated}
      />
    </>
  )
}
