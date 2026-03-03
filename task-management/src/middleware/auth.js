const jwt = require('jsonwebtoken');
const { getUserById } = require('../utils/mockUsers');

/**
 * Auth Middleware
 * -------------------------------------------------------------------
 * Validates the JWT token in the Authorization header.
 *
 * In development, if no real User Management service is running,
 * any token signed with JWT_SECRET will be accepted.
 * Mock user data is injected into req.user.
 *
 * When User Management service is ready, replace the mock user lookup
 * with an HTTP call: await axios.get(`${USER_SERVICE_URL}/api/users/${decoded.id}`)
 * -------------------------------------------------------------------
 */
const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Access denied.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Try to find user in mock data (replace with real service call later)
        const mockUser = getUserById(decoded.id);

        req.user = mockUser || {
            id: decoded.id,
            name: decoded.name || 'Unknown User',
            email: decoded.email || '',
            role: decoded.role || 'developer',
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

/**
 * Role-based access control middleware
 * Usage: authorize('admin', 'developer')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user?.role}' is not allowed to perform this action.`,
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
