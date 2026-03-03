const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
            default: '',
        },
        status: {
            type: String,
            enum: ['todo', 'in_progress', 'done'],
            default: 'todo',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
        },
        deadline: {
            type: Date,
            default: null,
        },
        assignedTo: {
            type: String,
            trim: true,
            default: null,
        },
        createdBy: {
            type: String,
            trim: true,
            default: 'system',
        },
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        tags: {
            type: [String],
            default: [],
        },
        project: {
            type: String,
            trim: true,
            default: 'General',
        },
        sprint: {
            type: String,
            trim: true,
            default: null,
        },
    },
    {
        timestamps: true, // adds createdAt and updatedAt
    }
);

// Index for faster queries by status and createdBy
taskSchema.index({ status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ deadline: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
