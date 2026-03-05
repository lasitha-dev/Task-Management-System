const jwt = require('jsonwebtoken');

/**
 * JWT Authentication middleware
 * Verifies token from Authorization header
 */
const authMiddleware = (req, res, next) => {
    // Skip auth for health check, sync endpoint, and non-API routes
    if (req.path === '/health' || req.path === '/api/sync/tasks') {
        return next();
    }

    // In test mode, allow requests without token to proceed
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

module.exports = { authMiddleware };
