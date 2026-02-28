const NotificationService = require('../../src/services/notificationService');

/**
 * Unit tests for NotificationService.
 * Uses mocked Mongoose models to test business logic in isolation.
 */

// --- Mock Factory ---
const createMockModel = (overrides = {}) => ({
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findOneAndUpdate: jest.fn().mockReturnThis(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    updateMany: jest.fn(),
    ...overrides,
});

describe('NotificationService', () => {
    let service;
    let NotificationModel;
    let PreferenceModel;

    beforeEach(() => {
        NotificationModel = createMockModel();
        PreferenceModel = createMockModel();
        service = new NotificationService(NotificationModel, PreferenceModel);
    });

    afterEach(() => jest.clearAllMocks());

    // -------------------------------------------------------------------------
    // getAllNotifications
    // -------------------------------------------------------------------------
    describe('getAllNotifications', () => {
        it('should return paginated notifications with default params', async () => {
            const mockNotifs = [{ _id: '1', title: 'Test' }];
            NotificationModel.lean.mockResolvedValue(mockNotifs);
            NotificationModel.countDocuments.mockResolvedValue(1);

            const result = await service.getAllNotifications({});

            expect(NotificationModel.find).toHaveBeenCalledWith({});
            expect(NotificationModel.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(NotificationModel.skip).toHaveBeenCalledWith(0);
            expect(NotificationModel.limit).toHaveBeenCalledWith(20);
            expect(result.notifications).toEqual(mockNotifs);
            expect(result.pagination).toEqual({ total: 1, page: 1, limit: 20, pages: 1 });
        });

        it('should apply recipientId filter', async () => {
            NotificationModel.lean.mockResolvedValue([]);
            NotificationModel.countDocuments.mockResolvedValue(0);

            await service.getAllNotifications({ recipientId: 'user_001' });

            expect(NotificationModel.find).toHaveBeenCalledWith({ recipientId: 'user_001' });
        });

        it('should apply type filter', async () => {
            NotificationModel.lean.mockResolvedValue([]);
            NotificationModel.countDocuments.mockResolvedValue(0);

            await service.getAllNotifications({ type: 'task_assigned' });

            expect(NotificationModel.find).toHaveBeenCalledWith({ type: 'task_assigned' });
        });

        it('should apply isRead boolean filter', async () => {
            NotificationModel.lean.mockResolvedValue([]);
            NotificationModel.countDocuments.mockResolvedValue(0);

            await service.getAllNotifications({ isRead: false });

            expect(NotificationModel.find).toHaveBeenCalledWith({ isRead: false });
        });

        it('should apply priority filter', async () => {
            NotificationModel.lean.mockResolvedValue([]);
            NotificationModel.countDocuments.mockResolvedValue(0);

            await service.getAllNotifications({ priority: 'high' });

            expect(NotificationModel.find).toHaveBeenCalledWith({ priority: 'high' });
        });

        it('should handle custom pagination', async () => {
            NotificationModel.lean.mockResolvedValue([]);
            NotificationModel.countDocuments.mockResolvedValue(50);

            const result = await service.getAllNotifications({ page: 3, limit: 10 });

            expect(NotificationModel.skip).toHaveBeenCalledWith(20);
            expect(NotificationModel.limit).toHaveBeenCalledWith(10);
            expect(result.pagination.page).toBe(3);
            expect(result.pagination.limit).toBe(10);
            expect(result.pagination.pages).toBe(5);
        });
    });

    // -------------------------------------------------------------------------
    // getNotificationById
    // -------------------------------------------------------------------------
    describe('getNotificationById', () => {
        it('should return a notification by ID', async () => {
            const mockNotif = { _id: 'abc123', title: 'Found' };
            NotificationModel.lean.mockResolvedValue(mockNotif);

            const result = await service.getNotificationById('abc123');

            expect(NotificationModel.findById).toHaveBeenCalledWith('abc123');
            expect(result).toEqual(mockNotif);
        });

        it('should throw 404 if notification not found', async () => {
            NotificationModel.lean.mockResolvedValue(null);

            await expect(service.getNotificationById('missing')).rejects.toMatchObject({
                message: 'Notification not found',
                statusCode: 404,
            });
        });
    });

    // -------------------------------------------------------------------------
    // createNotification
    // -------------------------------------------------------------------------
    describe('createNotification', () => {
        it('should create and return a new notification', async () => {
            const input = { type: 'task_assigned', title: 'New', message: 'Msg', recipientId: 'u1' };
            const created = { ...input, _id: 'new123', toObject: () => ({ ...input, _id: 'new123' }) };
            NotificationModel.create.mockResolvedValue(created);

            const result = await service.createNotification(input);

            expect(NotificationModel.create).toHaveBeenCalledWith(input);
            expect(result._id).toBe('new123');
        });
    });

    // -------------------------------------------------------------------------
    // markAsRead
    // -------------------------------------------------------------------------
    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            const updated = { _id: 'abc', isRead: true };
            NotificationModel.lean.mockResolvedValue(updated);

            const result = await service.markAsRead('abc');

            expect(NotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'abc',
                { isRead: true },
                { new: true, runValidators: true }
            );
            expect(result.isRead).toBe(true);
        });

        it('should throw 404 if notification not found', async () => {
            NotificationModel.lean.mockResolvedValue(null);

            await expect(service.markAsRead('missing')).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });

    // -------------------------------------------------------------------------
    // markAllAsRead
    // -------------------------------------------------------------------------
    describe('markAllAsRead', () => {
        it('should mark all unread notifications for a recipient as read', async () => {
            NotificationModel.updateMany.mockResolvedValue({ modifiedCount: 5 });

            const result = await service.markAllAsRead('user_001');

            expect(NotificationModel.updateMany).toHaveBeenCalledWith(
                { recipientId: 'user_001', isRead: false },
                { isRead: true }
            );
            expect(result.modifiedCount).toBe(5);
        });
    });

    // -------------------------------------------------------------------------
    // deleteNotification
    // -------------------------------------------------------------------------
    describe('deleteNotification', () => {
        it('should delete a notification and return it', async () => {
            const deleted = { _id: 'abc', title: 'Deleted' };
            NotificationModel.lean.mockResolvedValue(deleted);

            const result = await service.deleteNotification('abc');

            expect(NotificationModel.findByIdAndDelete).toHaveBeenCalledWith('abc');
            expect(result.title).toBe('Deleted');
        });

        it('should throw 404 if notification not found', async () => {
            NotificationModel.lean.mockResolvedValue(null);

            await expect(service.deleteNotification('missing')).rejects.toMatchObject({
                statusCode: 404,
            });
        });
    });

    // -------------------------------------------------------------------------
    // getUnreadCount
    // -------------------------------------------------------------------------
    describe('getUnreadCount', () => {
        it('should return the count of unread notifications', async () => {
            NotificationModel.countDocuments.mockResolvedValue(7);

            const result = await service.getUnreadCount('user_001');

            expect(NotificationModel.countDocuments).toHaveBeenCalledWith({
                recipientId: 'user_001',
                isRead: false,
            });
            expect(result.count).toBe(7);
        });

        it('should return 0 when all notifications are read', async () => {
            NotificationModel.countDocuments.mockResolvedValue(0);

            const result = await service.getUnreadCount('user_001');

            expect(result.count).toBe(0);
        });
    });

    // -------------------------------------------------------------------------
    // getPreferences
    // -------------------------------------------------------------------------
    describe('getPreferences', () => {
        it('should return existing preferences', async () => {
            const prefs = { userId: 'u1', emailEnabled: true };
            PreferenceModel.lean.mockResolvedValue(prefs);

            const result = await service.getPreferences('u1');

            expect(PreferenceModel.findOne).toHaveBeenCalledWith({ userId: 'u1' });
            expect(result).toEqual(prefs);
        });

        it('should create default preferences if none exist', async () => {
            PreferenceModel.lean.mockResolvedValue(null);
            const defaults = { userId: 'u2', emailEnabled: true, toObject: () => ({ userId: 'u2', emailEnabled: true }) };
            PreferenceModel.create.mockResolvedValue(defaults);

            const result = await service.getPreferences('u2');

            expect(PreferenceModel.create).toHaveBeenCalledWith({ userId: 'u2' });
            expect(result.userId).toBe('u2');
        });
    });

    // -------------------------------------------------------------------------
    // updatePreferences
    // -------------------------------------------------------------------------
    describe('updatePreferences', () => {
        it('should update and return preferences', async () => {
            const updated = { userId: 'u1', emailEnabled: false };
            PreferenceModel.lean.mockResolvedValue(updated);

            const result = await service.updatePreferences('u1', { emailEnabled: false });

            expect(PreferenceModel.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: 'u1' },
                { emailEnabled: false, userId: 'u1' },
                { new: true, upsert: true, runValidators: true }
            );
            expect(result.emailEnabled).toBe(false);
        });
    });
});
