/**
 * Proxy configuration and routing table.
 * Maps incoming API paths to their target microservice URLs.
 */
const proxyConfig = {
    routes: [
        {
            path: '/api/users',
            target: process.env.USER_SERVICE_URL || 'http://localhost:5001',
            pathRewrite: {},
        },
        {
            path: '/api/tasks',
            target: process.env.TASK_SERVICE_URL || 'http://localhost:5002',
            pathRewrite: {},
        },
        {
            path: '/api/notifications',
            target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003',
            pathRewrite: {},
        },
        {
            path: '/api/reports',
            target: process.env.REPORT_SERVICE_URL || 'http://localhost:5004',
            pathRewrite: {},
        },
    ],
};

module.exports = proxyConfig;
