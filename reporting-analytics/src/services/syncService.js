const TasksMirror = require('../models/TasksMirror');
const { TASK_STATUS, MOCK_USERNAMES, TASK_GENERATION_COUNT } = require('../utils/constants');
const { getRandomDate } = require('../utils/helpers');

/**
 * Generate fake tasks for mock mode
 * @returns {Array} - array of fake tasks
 */
const generateMockTasks = () => {
    const mockTasks = [];
    const statuses = [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DONE];

    for (let i = 1; i <= TASK_GENERATION_COUNT; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const assignedUserName = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
        const createdDate = getRandomDate();
        const completedAt = status === TASK_STATUS.DONE ? getRandomDate() : null;

        mockTasks.push({
            taskId: `TASK-${String(i).padStart(3, '0')}`,
            title: `Task ${i} - ${['Design homepage', 'Implement API', 'Fix bugs', 'Write tests', 'Review code'][i % 5]}`,
            status,
            assignedUserId: `USER-${String(Math.floor(i / 4) + 1).padStart(2, '0')}`,
            assignedUserName,
            createdAt: createdDate,
            completedAt
        });
    }

    return mockTasks;
};

/**
 * Sync tasks from external service or mock data
 * @returns {Promise<object>} - sync result
 */
const syncTasksFromExternal = async () => {
    try {
        console.log('🔄 Starting task sync...');

        let tasks = [];

        if (process.env.TASK_SERVICE_URL === 'mock') {
            // Generate mock data
            console.log('📦 Using mock mode - generating fake tasks');
            tasks = generateMockTasks();
        } else {
            // In real mode, would fetch from API Gateway
            // For now, generate mock data as placeholder
            console.log('🌐 Real mode configured but not implemented yet');
            tasks = generateMockTasks();
        }

        // Upsert tasks to TasksMirror collection
        for (const task of tasks) {
            await TasksMirror.updateOne(
                { taskId: task.taskId },
                { $set: task },
                { upsert: true }
            );
        }

        console.log(`✅ Sync completed: ${tasks.length} tasks upserted`);
        return {
            success: true,
            message: `Synced ${tasks.length} tasks`,
            count: tasks.length
        };
    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        return {
            success: false,
            message: error.message
        };
    }
};

module.exports = {
    syncTasksFromExternal,
    generateMockTasks
};
