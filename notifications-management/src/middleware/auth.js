const jwt = require('jsonwebtoken');

function protect(req, res, next) {
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

        req.user = {
            id: decoded.id,
            name: decoded.name || 'Unknown User',
            email: decoded.email || '',
            role: decoded.role || 'user',
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired.' });
        }

        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
}

module.exports = { protect };