const TasksMirror = require('../models/TasksMirror');
const { TASK_STATUS, MOCK_USERNAMES, TASK_GENERATION_COUNT } = require('../utils/constants');
const { getRandomDate } = require('../utils/helpers');

/**
 * Generate fake tasks for mock mode
 * Ensures tasks are 'done' with completedAt dates in current week
 * @returns {Array} - array of fake tasks
 */
const generateMockTasks = () => {
  const statuses = ['todo', 'inProgress', 'done', 'done', 'done', 'done', 'done'];
  const userNames = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis'];
  const tasks = [];
  const today = new Date();

  for (let i = 1; i <= 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const assignedUserName = userNames[Math.floor(Math.random() * userNames.length)];
    
    const createdDaysAgo = Math.floor(Math.random() * 7);
    const createdAt = new Date(today);
    createdAt.setDate(today.getDate() - createdDaysAgo);
    createdAt.setHours(Math.floor(Math.random() * 20) + 1);
    createdAt.setMinutes(Math.floor(Math.random() * 59));

    let completedAt = null;
    if (status === 'done') {
      const completedDaysAgo = Math.floor(Math.random() * 7);
      completedAt = new Date(today);
      completedAt.setDate(today.getDate() - completedDaysAgo);
      completedAt.setHours(Math.floor(Math.random() * 20) + 1);
      completedAt.setMinutes(Math.floor(Math.random() * 59));
    }

    tasks.push({
      taskId: `TASK-${String(i).padStart(3, '0')}`,
      title: `Task ${i}`,
      status,
      assignedUserId: `USER-0${(i % 5) + 1}`,
      assignedUserName,
      createdAt,
      completedAt
    });
  }
  return tasks;
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
