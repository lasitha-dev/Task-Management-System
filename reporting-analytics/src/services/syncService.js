const TasksMirror = require('../models/TasksMirror');
const { TASK_STATUS, MOCK_USERNAMES, TASK_GENERATION_COUNT } = require('../utils/constants');
const { getRandomDate } = require('../utils/helpers');

/**
 * Generate fake tasks for mock mode
 * Ensures consistent distribution:
 * - 12 done (60%)
 * - 5 inProgress (25%)
 * - 3 todo (15%)
 * @returns {Array} - array of fake tasks
 */
const generateMockTasks = () => {
  const userNames = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis'];
  const tasks = [];
  const today = new Date();

  // Create fixed distribution: 3 todo, 5 inProgress, 12 done
  const statusDistribution = [
    ...Array(3).fill('todo'),
    ...Array(5).fill('inProgress'),
    ...Array(12).fill('done')
  ];

  for (let i = 1; i <= 20; i++) {
    const status = statusDistribution[i - 1];
    const assignedUserName = userNames[(i % 5)];
    
    const createdDaysAgo = Math.floor(Math.random() * 7);
    const createdAt = new Date(today);
    createdAt.setDate(today.getDate() - createdDaysAgo);
    createdAt.setHours(Math.floor(Math.random() * 20) + 1);
    createdAt.setMinutes(Math.floor(Math.random() * 59));

    let completedAt = null;
    if (status === 'done') {
      completedAt = new Date();
      const daysBack = Math.floor(Math.random() * 6);
      completedAt.setDate(completedAt.getDate() - daysBack);
      completedAt.setHours(8 + Math.floor(Math.random() * 10));
      completedAt.setMinutes(Math.floor(Math.random() * 59));
      completedAt.setSeconds(0);
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
