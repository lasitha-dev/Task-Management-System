const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimiter } = require('./middleware/rateLimiter');
const { logger } = require('./middleware/logger');
const proxyConfig = require('./config/proxyConfig');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimiter);

// Proxy Routes
const { routes } = proxyConfig;

routes.forEach((route) => {
    app.use(
        route.path,
        createProxyMiddleware({
            target: route.target,
            changeOrigin: true,
            pathRewrite: route.pathRewrite || {},
        })
    );
});

// Gateway Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'api-gateway' });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});

module.exports = app;
