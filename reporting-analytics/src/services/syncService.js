const TasksMirror = require('../models/TasksMirror');
const { TASK_STATUS, MOCK_USERNAMES, TASK_GENERATION_COUNT } = require('../utils/constants');
const { getRandomDate } = require('../utils/helpers');

/**
 * Generate fake tasks for mock mode
 * Ensures at least 8 tasks are 'done' with completedAt dates in current week
 * @returns {Array} - array of fake tasks
 */
const generateMockTasks = () => {
    const mockTasks = [];
    
    // Create status array: at least 8 'done', rest distributed
    const statuses = [];
    for (let i = 0; i < 8; i++) {
        statuses.push(TASK_STATUS.DONE);
    }
    for (let i = 8; i < TASK_GENERATION_COUNT; i++) {
        statuses.push(i % 2 === 0 ? TASK_STATUS.TODO : TASK_STATUS.IN_PROGRESS);
    }
    
    // Shuffle statuses randomly
    for (let i = statuses.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [statuses[i], statuses[j]] = [statuses[j], statuses[i]];
    }

    for (let i = 1; i <= TASK_GENERATION_COUNT; i++) {
        const status = statuses[i - 1];
        const assignedUserName = MOCK_USERNAMES[Math.floor(Math.random() * MOCK_USERNAMES.length)];
        const createdDate = getRandomDate();
        
        // For done tasks, ensure completedAt is within current week (last 7 days)
        let completedAt = null;
        if (status === TASK_STATUS.DONE) {
            const today = new Date();
            const daysAgo = Math.floor(Math.random() * 7);
            completedAt = new Date(today);
            completedAt.setDate(today.getDate() - daysAgo);
            completedAt.setHours(Math.floor(Math.random() * 23));
            completedAt.setMinutes(Math.floor(Math.random() * 59));
        }

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

        // Clear old mock data before inserting fresh data
        await TasksMirror.deleteMany({});

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
