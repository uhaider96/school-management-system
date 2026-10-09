const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Central Secret Key (Fallback match with authRoutes)
const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// 1. Verify JWT Token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Verify Token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Fetch user without password
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found in database' });
            }

            return next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }
};

// 2. Role Based Authorization (Case-insensitive check)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User context missing' });
        }

        // Standardize both strings to lowercase for bulletproof checking
        const userRole = req.user.role ? req.user.role.toLowerCase() : '';
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                success: false, 
                message: `User role '${req.user.role}' is not authorized to access this route` 
            });
        }
        next();
    };
};

module.exports = { protect, authorize, JWT_SECRET };