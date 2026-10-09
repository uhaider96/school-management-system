const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple'); // ya jsonwebtoken
const User = require('../models/User');

// 1. REGISTER USER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Tamam fields required hain.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Is email par user pehle se registered hai.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'Account successfully create ho gaya hai. Ab login karein.' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. FORGOT PASSWORD (RESET PASSWORD)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ success: false, message: 'Email aur new password required hain.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Is email ka koi account nahi mila.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password successfully reset ho gaya hai! Naye password se login karein.' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;