const Task = require('../models/Task');

/**
 * Create a new task
 */
async function createTask(data) {
    const task = new Task(data);
    return await task.save();
}

/**
 * Get all tasks with optional filters
 * Supported filters: status, priority, assignedTo, createdBy, project, sprint
 */
async function getAllTasks(filters = {}) {
    const query = {};

    if (filters.status)     query.status     = filters.status;
    if (filters.priority)   query.priority   = filters.priority;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.createdBy)  query.createdBy  = filters.createdBy;
    if (filters.project)    query.project    = filters.project;
    if (filters.sprint)     query.sprint     = filters.sprint;

    return await Task.find(query).sort({ createdAt: -1 });
}

/**
 * Get a single task by ID
 */
async function getTaskById(id) {
    return await Task.findById(id);
}

/**
 * Update a task fully (PUT)
 */
async function updateTask(id, data) {
    return await Task.findByIdAndUpdate(
        id,
        { ...data },
        { new: true, runValidators: true }
    );
}

/**
 * Partially update a task (PATCH) — used for drag-drop status change
 */
async function patchTask(id, data) {
    return await Task.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
}

/**
 * Delete a task by ID
 */
async function deleteTask(id) {
    return await Task.findByIdAndDelete(id);
}

/**
 * Get task counts grouped by status (for analytics/reporting)
 */
async function getTaskStats(filters = {}) {
    const query = {};
    if (filters.createdBy)  query.createdBy  = filters.createdBy;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (filters.project)    query.project    = filters.project;

    const stats = await Task.aggregate([
        { $match: query },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // Normalise into { todo: N, in_progress: N, done: N }
    const result = { todo: 0, in_progress: 0, done: 0, total: 0 };
    stats.forEach(({ _id, count }) => {
        if (_id in result) result[_id] = count;
        result.total += count;
    });

    return result;
}

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    patchTask,
    deleteTask,
    getTaskStats,
};
