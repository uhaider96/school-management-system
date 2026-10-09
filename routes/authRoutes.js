const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. LOGIN USER (Sub ke liye open)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email aur password required hain.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'Ghalat email ya password.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Ghalat email ya password.' });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 2. FORGOT PASSWORD (Sub ke liye open)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email aur new password required hain.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'Is email ka koi account nahi mila.' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ success: true, message: 'Password successfully reset ho gaya hai! Ab naye password se login karein.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 3. CREATE USER (Sirf Admin Dashboard se call hoga)
router.post('/create-user', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Tamam fields required hain.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: 'Is email par user pehle se registered hai.' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Role select karne ki azadi (Default: Accountant)
        const userRole = role && ['Admin', 'Accountant'].includes(role) ? role : 'Accountant';

        await User.create({ name, email, password: hashedPassword, role: userRole });

        res.status(201).json({ success: true, message: `Naya account (${userRole}) create ho gaya hai.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;