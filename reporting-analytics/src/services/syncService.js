const TasksMirror = require('../models/TasksMirror');
const { TASK_STATUS, MOCK_USERNAMES, TASK_GENERATION_COUNT } = require('../utils/constants');
const { getRandomDate } = require('../utils/helpers');

const generateMockTasks = () => {
  const userNames = [
    'Alice Johnson', 'Bob Smith', 'Carol Williams', 
    'David Brown', 'Emma Davis'
  ];
  
  const today = new Date();
  const tasks = [];
  
  // FIXED: Always exactly 12 done, 5 inProgress, 3 todo
  const taskConfig = [
    { id: 'TASK-001', status: 'done', user: 0, daysAgo: 0 },
    { id: 'TASK-002', status: 'done', user: 1, daysAgo: 0 },
    { id: 'TASK-003', status: 'done', user: 2, daysAgo: 1 },
    { id: 'TASK-004', status: 'done', user: 3, daysAgo: 1 },
    { id: 'TASK-005', status: 'done', user: 4, daysAgo: 2 },
    { id: 'TASK-006', status: 'done', user: 0, daysAgo: 2 },
    { id: 'TASK-007', status: 'done', user: 1, daysAgo: 3 },
    { id: 'TASK-008', status: 'done', user: 2, daysAgo: 3 },
    { id: 'TASK-009', status: 'done', user: 3, daysAgo: 4 },
    { id: 'TASK-010', status: 'done', user: 4, daysAgo: 4 },
    { id: 'TASK-011', status: 'done', user: 0, daysAgo: 5 },
    { id: 'TASK-012', status: 'done', user: 1, daysAgo: 5 },
    { id: 'TASK-013', status: 'inProgress', user: 2, daysAgo: null },
    { id: 'TASK-014', status: 'inProgress', user: 3, daysAgo: null },
    { id: 'TASK-015', status: 'inProgress', user: 4, daysAgo: null },
    { id: 'TASK-016', status: 'inProgress', user: 0, daysAgo: null },
    { id: 'TASK-017', status: 'inProgress', user: 1, daysAgo: null },
    { id: 'TASK-018', status: 'todo', user: 2, daysAgo: null },
    { id: 'TASK-019', status: 'todo', user: 3, daysAgo: null },
    { id: 'TASK-020', status: 'todo', user: 4, daysAgo: null },
  ];

  taskConfig.forEach((config, index) => {
    const createdAt = new Date(today);
    createdAt.setDate(today.getDate() - 6);
    createdAt.setHours(8 + index, 0, 0, 0);

    let completedAt = null;
    if (config.status === 'done' && config.daysAgo !== null) {
      completedAt = new Date(today);
      completedAt.setDate(today.getDate() - config.daysAgo);
      // Spread hours across different times to create chart curve: [9,14,10,16,8,15,11,17,9,13,10,15]
      completedAt.setHours([9, 14, 10, 16, 8, 15, 11, 17, 9, 13, 10, 15][index], 30, 0, 0);
    }

    tasks.push({
      taskId: config.id,
      title: `Task ${config.id} - ${config.status}`,
      status: config.status,
      assignedUserId: `USER-0${config.user + 1}`,
      assignedUserName: userNames[config.user],
      createdAt,
      completedAt
    });
  });

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
