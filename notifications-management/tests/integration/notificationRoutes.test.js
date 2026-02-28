const request = require('supertest');
const express = require('express');

/**
 * Integration tests for Notification routes.
 * Mocks the Mongoose models at the module level so no real DB is needed.
 * Tests the full Express middleware chain: routes → validators → controller → service.
 */

// --- Mock Mongoose Models before requiring app modules ---
const mockNotifications = [
    {
        _id: '507f1f77bcf86cd799439011',
        type: 'task_assigned',
        title: 'Test Task',
        message: 'You have been assigned a task',
        recipientId: 'user_001',
        isRead: false,
        priority: 'high',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// Build a standalone Express app with the routes for testing
function createTestApp() {
    const app = express();
    app.use(express.json());

    // Mock the models
    const mockModel = {
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockNotifications),
        findById: jest.fn().mockReturnThis(),
        findByIdAndUpdate: jest.fn().mockReturnThis(),
        findByIdAndDelete: jest.fn().mockReturnThis(),
        findOne: jest.fn().mockReturnThis(),
        findOneAndUpdate: jest.fn().mockReturnThis(),
        countDocuments: jest.fn().mockResolvedValue(1),
        create: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const mockPrefModel = {
        findOne: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ userId: 'user_001', emailEnabled: true, inAppEnabled: true }),
        findOneAndUpdate: jest.fn().mockReturnThis(),
        create: jest.fn(),
    };

    // Wire up service and controller
    const NotificationService = require('../../src/services/notificationService');
    const NotificationController = require('../../src/controllers/notificationController');
    const {
        validateCreateNotification,
        validateObjectId,
        validateMarkAllRead,
        validateUpdatePreferences,
    } = require('../../src/middleware/validators');

    const service = new NotificationService(mockModel, mockPrefModel);
    const controller = new NotificationController(service);

    const router = express.Router();
    router.get('/', controller.getNotifications);
    router.get('/unread-count', controller.getUnreadCount);
    router.patch('/read-all', validateMarkAllRead, controller.markAllAsRead);
    router.get('/preferences/:userId', controller.getPreferences);
    router.put('/preferences/:userId', validateUpdatePreferences, controller.updatePreferences);
    router.get('/:id', validateObjectId, controller.getNotificationById);
    router.post('/', validateCreateNotification, controller.createNotification);
    router.patch('/:id/read', validateObjectId, controller.markAsRead);
    router.delete('/:id', validateObjectId, controller.deleteNotification);

    app.use('/api/notifications', router);

    // Error handler
    const { errorHandler } = require('../../src/middleware/errorHandler');
    app.use(errorHandler);

    return { app, mockModel, mockPrefModel };
}

describe('Notification Routes — Integration Tests', () => {
    let app, mockModel, mockPrefModel;

    beforeEach(() => {
        const testSetup = createTestApp();
        app = testSetup.app;
        mockModel = testSetup.mockModel;
        mockPrefModel = testSetup.mockPrefModel;
    });

    // -------------------------------------------------------------------------
    // GET /api/notifications
    // -------------------------------------------------------------------------
    describe('GET /api/notifications', () => {
        it('should return 200 with a list of notifications', async () => {
            const res = await request(app).get('/api/notifications');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.notifications).toBeDefined();
            expect(res.body.data.pagination).toBeDefined();
        });

        it('should accept query filters', async () => {
            const res = await request(app)
                .get('/api/notifications?recipientId=user_001&type=task_assigned&isRead=false');

            expect(res.status).toBe(200);
        });
    });

    // -------------------------------------------------------------------------
    // GET /api/notifications/unread-count
    // -------------------------------------------------------------------------
    describe('GET /api/notifications/unread-count', () => {
        it('should return 200 with unread count', async () => {
            const res = await request(app)
                .get('/api/notifications/unread-count?recipientId=user_001');

            expect(res.status).toBe(200);
            expect(res.body.data.count).toBeDefined();
        });
    });

    // -------------------------------------------------------------------------
    // POST /api/notifications
    // -------------------------------------------------------------------------
    describe('POST /api/notifications', () => {
        it('should return 201 when creating a valid notification', async () => {
            const newNotif = {
                type: 'task_assigned',
                title: 'Test Task',
                message: 'You have a new task',
                recipientId: 'user_001',
                priority: 'medium',
            };
            mockModel.create.mockResolvedValue({
                ...newNotif,
                _id: 'new123',
                toObject: () => ({ ...newNotif, _id: 'new123' }),
            });

            const res = await request(app)
                .post('/api/notifications')
                .send(newNotif);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should return 400 for missing required fields', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .send({ type: 'task_assigned' }); // missing title, message, recipientId

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        it('should return 400 for invalid notification type', async () => {
            const res = await request(app)
                .post('/api/notifications')
                .send({
                    type: 'invalid_type',
                    title: 'Test',
                    message: 'Msg',
                    recipientId: 'u1',
                });

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });
    });

    // -------------------------------------------------------------------------
    // GET /api/notifications/:id
    // -------------------------------------------------------------------------
    describe('GET /api/notifications/:id', () => {
        it('should return 200 for a valid ObjectId', async () => {
            mockModel.lean.mockResolvedValue(mockNotifications[0]);

            const res = await request(app)
                .get('/api/notifications/507f1f77bcf86cd799439011');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should return 400 for an invalid ObjectId', async () => {
            const res = await request(app)
                .get('/api/notifications/invalid-id');

            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });
    });

    // -------------------------------------------------------------------------
    // PATCH /api/notifications/:id/read
    // -------------------------------------------------------------------------
    describe('PATCH /api/notifications/:id/read', () => {
        it('should return 200 when marking as read', async () => {
            mockModel.lean.mockResolvedValue({ ...mockNotifications[0], isRead: true });

            const res = await request(app)
                .patch('/api/notifications/507f1f77bcf86cd799439011/read');

            expect(res.status).toBe(200);
        });

        it('should return 400 for invalid id', async () => {
            const res = await request(app)
                .patch('/api/notifications/bad-id/read');

            expect(res.status).toBe(400);
        });
    });

    // -------------------------------------------------------------------------
    // PATCH /api/notifications/read-all
    // -------------------------------------------------------------------------
    describe('PATCH /api/notifications/read-all', () => {
        it('should return 200 when marking all as read', async () => {
            const res = await request(app)
                .patch('/api/notifications/read-all')
                .send({ recipientId: 'user_001' });

            expect(res.status).toBe(200);
            expect(res.body.data.modifiedCount).toBeDefined();
        });

        it('should return 400 when recipientId is missing', async () => {
            const res = await request(app)
                .patch('/api/notifications/read-all')
                .send({});

            expect(res.status).toBe(400);
        });
    });

    // -------------------------------------------------------------------------
    // DELETE /api/notifications/:id
    // -------------------------------------------------------------------------
    describe('DELETE /api/notifications/:id', () => {
        it('should return 200 when deleting a notification', async () => {
            mockModel.lean.mockResolvedValue(mockNotifications[0]);

            const res = await request(app)
                .delete('/api/notifications/507f1f77bcf86cd799439011');

            expect(res.status).toBe(200);
        });

        it('should return 400 for invalid id format', async () => {
            const res = await request(app)
                .delete('/api/notifications/not-valid');

            expect(res.status).toBe(400);
        });
    });

    // -------------------------------------------------------------------------
    // Preferences
    // -------------------------------------------------------------------------
    describe('GET /api/notifications/preferences/:userId', () => {
        it('should return 200 with user preferences', async () => {
            const res = await request(app)
                .get('/api/notifications/preferences/user_001');

            expect(res.status).toBe(200);
            expect(res.body.data.userId).toBe('user_001');
        });
    });

    describe('PUT /api/notifications/preferences/:userId', () => {
        it('should return 200 when updating preferences', async () => {
            mockPrefModel.lean.mockResolvedValue({ userId: 'user_001', emailEnabled: false, inAppEnabled: true });

            const res = await request(app)
                .put('/api/notifications/preferences/user_001')
                .send({ emailEnabled: false });

            expect(res.status).toBe(200);
        });
    });
});
