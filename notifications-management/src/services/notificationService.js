const { RESPONSE_MESSAGES } = require('../utils/constants');

function createNotFoundError() {
    const error = new Error(RESPONSE_MESSAGES.NOTIFICATION_NOT_FOUND);
    error.statusCode = 404;
    return error;
}

/**
 * Notification Service
 * Encapsulates all business logic for notification CRUD and preferences.
 * Models are injected to support testability (Dependency Inversion).
 */
class NotificationService {
    constructor(NotificationModel, PreferenceModel) {
        this.Notification = NotificationModel;
        this.Preference = PreferenceModel;
    }

    /**
     * Retrieve notifications with optional filters and pagination.
     */
    async getAllNotifications({ recipientId, type, isRead, priority, page = 1, limit = 20 }) {
        const filter = {};
        if (recipientId) filter.recipientId = recipientId;
        if (type) filter.type = type;
        if (typeof isRead === 'boolean') filter.isRead = isRead;
        if (priority) filter.priority = priority;

        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            this.Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            this.Notification.countDocuments(filter),
        ]);

        return {
            notifications,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Retrieve a single notification by its ID.
     */
    async getNotificationById(id, recipientId = null) {
        const filter = recipientId ? { _id: id, recipientId } : { _id: id };
        const notification = await this.Notification.findOne(filter).lean();
        if (!notification) {
            throw createNotFoundError();
        }
        return notification;
    }

    /**
     * Create a new notification.
     */
    async createNotification(data) {
        const notification = await this.Notification.create(data);
        return notification.toObject();
    }

    /**
     * Mark a single notification as read.
     */
    async markAsRead(id, recipientId = null) {
        const filter = recipientId ? { _id: id, recipientId } : { _id: id };
        const notification = await this.Notification.findOneAndUpdate(
            filter,
            { isRead: true },
            { new: true, runValidators: true }
        ).lean();

        if (!notification) {
            throw createNotFoundError();
        }
        return notification;
    }

    /**
     * Mark all notifications for a recipient as read.
     */
    async markAllAsRead(recipientId) {
        const result = await this.Notification.updateMany(
            { recipientId, isRead: false },
            { isRead: true }
        );
        return { modifiedCount: result.modifiedCount };
    }

    /**
     * Delete a notification by ID.
     */
    async deleteNotification(id, recipientId = null) {
        const filter = recipientId ? { _id: id, recipientId } : { _id: id };
        const notification = await this.Notification.findOneAndDelete(filter).lean();
        if (!notification) {
            throw createNotFoundError();
        }
        return notification;
    }

    /**
     * Get the count of unread notifications for a recipient.
     */
    async getUnreadCount(recipientId) {
        const count = await this.Notification.countDocuments({ recipientId, isRead: false });
        return { count };
    }

    /**
     * Retrieve notification preferences for a user. Creates defaults if none exist.
     */
    async getPreferences(userId) {
        let prefs = await this.Preference.findOne({ userId }).lean();
        if (!prefs) {
            prefs = await this.Preference.create({ userId });
            prefs = prefs.toObject();
        }
        return prefs;
    }

    /**
     * Update notification preferences for a user (upsert).
     */
    async updatePreferences(userId, data) {
        const prefs = await this.Preference.findOneAndUpdate(
            { userId },
            { ...data, userId },
            { new: true, upsert: true, runValidators: true }
        ).lean();
        return prefs;
    }
}

module.exports = NotificationService;
