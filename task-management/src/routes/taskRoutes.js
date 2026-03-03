const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    patchTask,
    deleteTask,
    getTaskStats,
    getUsers,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// ─── Validation rules ──────────────────────────────────────────────────────────
const createTaskValidation = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('status')
        .optional()
        .isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('progress')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
];

const updateTaskValidation = [
    body('title')
        .optional()
        .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
    body('status')
        .optional()
        .isIn(['todo', 'in_progress', 'done']).withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('progress')
        .optional()
        .isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
];

// ─── Routes ────────────────────────────────────────────────────────────────────

// Stats & Users (specific routes before :id to avoid conflicts)
router.get('/stats',       protect, getTaskStats);
router.get('/users',       protect, getUsers);

// CRUD
router.get('/',            protect, getAllTasks);
router.post('/',           protect, createTaskValidation, createTask);
router.get('/:id',         protect, getTaskById);
router.put('/:id',         protect, updateTaskValidation, updateTask);
router.patch('/:id',       protect, updateTaskValidation, patchTask);
router.delete('/:id',      protect, deleteTask);

module.exports = router;
