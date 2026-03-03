const { validationResult } = require('express-validator');
const taskService = require('../services/taskService');
const { getAllUsers } = require('../utils/mockUsers');

// ─── Helper ────────────────────────────────────────────────────────────────────
function handleValidationErrors(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    return null;
}

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
const getAllTasks = async (req, res) => {
    try {
        const { status, priority, assignedTo, project, sprint } = req.query;
        const filters = {};

        if (status)     filters.status     = status;
        if (priority)   filters.priority   = priority;
        if (assignedTo) filters.assignedTo = assignedTo;
        if (project)    filters.project    = project;
        if (sprint)     filters.sprint     = sprint;

        const tasks = await taskService.getAllTasks(filters);

        res.status(200).json({
            success: true,
            count: tasks.length,
            tasks,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
const getTaskById = async (req, res) => {
    try {
        const task = await taskService.getTaskById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid task ID.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
const createTask = async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
        const { title, description, status, priority, deadline, assignedTo, progress, tags, project, sprint } = req.body;

        const task = await taskService.createTask({
            title,
            description,
            status,
            priority,
            deadline: deadline || null,
            assignedTo: assignedTo || null,
            createdBy: req.user?.name || req.user?.id || 'system',
            progress: progress || 0,
            tags: tags || [],
            project: project || 'General',
            sprint: sprint || null,
        });

        res.status(201).json({ success: true, message: 'Task created successfully.', task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
const updateTask = async (req, res) => {
    const validationError = handleValidationErrors(req, res);
    if (validationError) return;

    try {
        const task = await taskService.updateTask(req.params.id, req.body);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        res.status(200).json({ success: true, message: 'Task updated successfully.', task });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid task ID.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── PATCH /api/tasks/:id ─────────────────────────────────────────────────────
// Used by drag-and-drop to update status only (or any partial update)
const patchTask = async (req, res) => {
    try {
        const task = await taskService.patchTask(req.params.id, req.body);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        res.status(200).json({ success: true, message: 'Task patched successfully.', task });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid task ID.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
const deleteTask = async (req, res) => {
    try {
        const task = await taskService.deleteTask(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        res.status(200).json({ success: true, message: 'Task deleted successfully.' });
    } catch (error) {
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ success: false, message: 'Invalid task ID.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/tasks/stats ─────────────────────────────────────────────────────
const getTaskStats = async (req, res) => {
    try {
        const stats = await taskService.getTaskStats(req.query);
        res.status(200).json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── GET /api/tasks/users (mock — replace with real service call later) ───────
const getUsers = (req, res) => {
    const users = getAllUsers();
    res.status(200).json({ success: true, users });
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    patchTask,
    deleteTask,
    getTaskStats,
    getUsers,
};
