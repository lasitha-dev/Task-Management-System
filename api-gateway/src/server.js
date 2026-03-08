const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimiter } = require('./middleware/rateLimiter');
const { logger } = require('./middleware/logger');
const proxyConfig = require('./config/proxyConfig');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware ORDER matters!
app.use(cors());
// DO NOT parse body before proxy - let proxy forward raw body
// app.use(express.json()); // REMOVED - conflicts with proxy
app.use(logger);
app.use(rateLimiter);

// Gateway Health Check (must be BEFORE proxy routes)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'api-gateway' });
});

// Proxy middleware for all /api/* routes
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5002', // Default to task-management
    changeOrigin: true,
    pathRewrite: (path, req) => {
        // Add /api back to the path since app.use strips it
        return '/api' + path;
    },
    router: function(req) {
        // Route to different services based on path (req.url has /api stripped)
        if (req.url.startsWith('/users')) {
            return process.env.USER_SERVICE_URL || 'http://localhost:5001';
        }
        if (req.url.startsWith('/tasks') || req.url.startsWith('/boards')) {
            return process.env.TASK_SERVICE_URL || 'http://localhost:5002';
        }
        if (req.url.startsWith('/notifications')) {
            return process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003';
        }
        if (req.url.startsWith('/reports')) {
            return process.env.REPORTING_SERVICE_URL || 'http://localhost:5004';
        }
        return 'http://localhost:5002'; // default
    },
    onProxyReq: (proxyReq, req) => {
        console.log(`[Gateway Proxy] ${req.method} /api${req.url} -> Target service`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`[Gateway Proxy] Response: ${proxyRes.statusCode} for ${req.method} /api${req.url}`);
    },
    logLevel: 'debug'
}));

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});

const configuredApp = createApp();

if (require.main === module) {
    configuredApp.listen(PORT, () => {
        console.log(`API Gateway running on port ${PORT}`);
    });
}

module.exports = { app: configuredApp, createApp };
