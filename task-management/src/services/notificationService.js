const axios = require('axios');

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://api-gateway:8000';

function buildHeaders(authToken) {
    const headers = {
        'Content-Type': 'application/json',
        'x-notification-source': 'task-management',
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    return headers;
}

async function createNotification(notification, authToken = null) {
    const response = await axios.post(
        `${API_GATEWAY_URL}/api/notifications`,
        notification,
        {
            timeout: 5000,
            headers: buildHeaders(authToken),
        }
    );

    return response.data?.data || null;
}

async function createBulkNotifications(notifications, authToken = null) {
    if (!Array.isArray(notifications) || notifications.length === 0) {
        return [];
    }

    return Promise.all(notifications.map((notification) => createNotification(notification, authToken)));
}

module.exports = {
    createNotification,
    createBulkNotifications,
};