/**
 * Task Management - Unit Tests
 * Run: npm test
 */

require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');

// ─── Generate a test token ─────────────────────────────────────────────────────
const testToken = jwt.sign(
    { id: 'user_001', name: 'Alex Morgan', email: 'alex@merncore.dev', role: 'admin' },
    process.env.JWT_SECRET || 'taskmanagement_super_secret_key_2026',
    { expiresIn: '1h' }
);

const authHeader = `Bearer ${testToken}`;

let createdTaskId;

// ─── Connect / Disconnect DB ───────────────────────────────────────────────────
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
    // Clean up test tasks
    if (createdTaskId) {
        await mongoose.connection.collection('tasks').deleteOne({
            _id: new mongoose.Types.ObjectId(createdTaskId),
        });
    }
    await mongoose.disconnect();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
describe('Health Check', () => {
    it('GET /health → 200 OK', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.service).toBe('task-management');
    });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe('Authentication', () => {
    it('GET /api/tasks without token → 401', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.status).toBe(401);
    });

    it('GET /api/tasks with invalid token → 401', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(401);
    });
});

// ─── Task CRUD ────────────────────────────────────────────────────────────────
describe('Task CRUD', () => {
    it('POST /api/tasks → creates a new task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', authHeader)
            .send({
                title: 'Test Task from Jest',
                description: 'Automated test task',
                status: 'todo',
                priority: 'high',
                project: 'Test Project',
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.task.title).toBe('Test Task from Jest');
        createdTaskId = res.body.task._id;
    });

    it('POST /api/tasks without title → 400 validation error', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', authHeader)
            .send({ description: 'No title task' });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('GET /api/tasks → returns task list', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', authHeader);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.tasks)).toBe(true);
    });

    it('GET /api/tasks?status=todo → filters by status', async () => {
        const res = await request(app)
            .get('/api/tasks?status=todo')
            .set('Authorization', authHeader);

        expect(res.status).toBe(200);
        res.body.tasks.forEach((t) => expect(t.status).toBe('todo'));
    });

    it('GET /api/tasks/:id → returns single task', async () => {
        const res = await request(app)
            .get(`/api/tasks/${createdTaskId}`)
            .set('Authorization', authHeader);

        expect(res.status).toBe(200);
        expect(res.body.task._id).toBe(createdTaskId);
    });

    it('GET /api/tasks/invalid-id → 400 bad ID', async () => {
        const res = await request(app)
            .get('/api/tasks/notanid')
            .set('Authorization', authHeader);

        expect(res.status).toBe(400);
    });

    it('PUT /api/tasks/:id → updates task', async () => {
        const res = await request(app)
            .put(`/api/tasks/${createdTaskId}`)
            .set('Authorization', authHeader)
            .send({ title: 'Updated Test Task', priority: 'urgent' });

        expect(res.status).toBe(200);
        expect(res.body.task.title).toBe('Updated Test Task');
        expect(res.body.task.priority).toBe('urgent');
    });

    it('PATCH /api/tasks/:id → updates status (drag-drop)', async () => {
        const res = await request(app)
            .patch(`/api/tasks/${createdTaskId}`)
            .set('Authorization', authHeader)
            .send({ status: 'in_progress' });

        expect(res.status).toBe(200);
        expect(res.body.task.status).toBe('in_progress');
    });

    it('GET /api/tasks/stats → returns counts by status', async () => {
        const res = await request(app)
            .get('/api/tasks/stats')
            .set('Authorization', authHeader);

        expect(res.status).toBe(200);
        expect(res.body.stats).toHaveProperty('total');
        expect(res.body.stats).toHaveProperty('todo');
        expect(res.body.stats).toHaveProperty('in_progress');
        expect(res.body.stats).toHaveProperty('done');
    });

    it('GET /api/tasks/users → returns mock users', async () => {
        const res = await request(app)
            .get('/api/tasks/users')
            .set('Authorization', authHeader);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.users)).toBe(true);
        expect(res.body.users.length).toBeGreaterThan(0);
    });

    it('DELETE /api/tasks/:id → deletes task', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${createdTaskId}`)
            .set('Authorization', authHeader);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        createdTaskId = null; // Prevent afterAll cleanup attempt
    });

    it('GET /api/tasks/:id (deleted) → 404', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .get(`/api/tasks/${fakeId}`)
            .set('Authorization', authHeader);

        expect(res.status).toBe(404);
    });
});
