const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../src/config/db');
jest.mock('../../src/models/TasksMirror');

describe('Sync API Endpoints', () => {
    beforeAll(() => {
        jest.spyOn(mongoose, 'connect').mockResolvedValue({
            connection: { host: 'localhost' }
        });
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('POST /api/sync/tasks', () => {
        it('should trigger sync successfully', async () => {
            const res = await request(app)
                .post('/api/sync/tasks');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('message');
            expect(res.body.data).toHaveProperty('count');
        });

        it('should return sync result with count', async () => {
            const res = await request(app)
                .post('/api/sync/tasks');

            expect(res.status).toBe(200);
            expect(res.body.data.count).toBe(20); // Mock generates 20 tasks
        });
    });
});
