const syncService = require('../../src/services/syncService');
const TasksMirror = require('../../src/models/TasksMirror');

// Mock dependencies
jest.mock('../../src/models/TasksMirror');

describe('Sync Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.TASK_SERVICE_URL = 'mock';
    });

    describe('generateMockTasks', () => {
        it('should generate 20 mock tasks', async () => {
            const tasks = syncService.generateMockTasks();

            expect(Array.isArray(tasks)).toBe(true);
            expect(tasks.length).toBe(20);
        });

        it('should generate tasks with all required fields', async () => {
            const tasks = syncService.generateMockTasks();

            expect(tasks[0]).toHaveProperty('taskId');
            expect(tasks[0]).toHaveProperty('title');
            expect(tasks[0]).toHaveProperty('status');
            expect(tasks[0]).toHaveProperty('assignedUserId');
            expect(tasks[0]).toHaveProperty('assignedUserName');
            expect(tasks[0]).toHaveProperty('createdAt');
        });

        it('should generate tasks with valid statuses', async () => {
            const tasks = syncService.generateMockTasks();
            const validStatuses = ['todo', 'inProgress', 'done'];

            tasks.forEach(task => {
                expect(validStatuses).toContain(task.status);
            });
        });

        it('should have unique task IDs', async () => {
            const tasks = syncService.generateMockTasks();
            const ids = tasks.map(t => t.taskId);
            const uniqueIds = new Set(ids);

            expect(uniqueIds.size).toBe(tasks.length);
        });

        it('should assign tasks to users from mock list', async () => {
            const tasks = syncService.generateMockTasks();
            const validNames = [
                'Alice Johnson',
                'Bob Smith',
                'Carol Williams',
                'David Brown',
                'Emma Davis'
            ];

            tasks.forEach(task => {
                expect(validNames).toContain(task.assignedUserName);
            });
        });
    });

    describe('syncTasksFromExternal', () => {
        it('should sync tasks in mock mode', async () => {
            TasksMirror.updateOne = jest.fn().mockResolvedValue({});

            const result = await syncService.syncTasksFromExternal();

            expect(result.success).toBe(true);
            expect(result.count).toBe(20);
            expect(TasksMirror.updateOne).toHaveBeenCalled();
        });

        it('should return success message', async () => {
            TasksMirror.updateOne = jest.fn().mockResolvedValue({});

            const result = await syncService.syncTasksFromExternal();

            expect(result.message).toMatch(/Synced 20 tasks/);
        });

        it('should handle sync errors gracefully', async () => {
            TasksMirror.updateOne = jest.fn().mockRejectedValue(new Error('DB Error'));

            const result = await syncService.syncTasksFromExternal();

            expect(result.success).toBe(false);
            expect(result.message).toBeDefined();
        });
    });
});
