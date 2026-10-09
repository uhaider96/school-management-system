const express = require('express');
const router = express.Router();
const Class = require('../models/Class');
const { protect, authorize } = require('../middleware/authMiddleware');

// Match route: POST /
router.post('/', protect, authorize('Admin'), async (req, res) => {
    try {
        const newClass = new Class(req.body);
        const savedClass = await newClass.save();
        res.status(201).json({ success: true, data: savedClass });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Match route: GET /
router.get('/', protect, async (req, res) => {
    try {
        const classes = await Class.find();
        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update Class (PUT /api/classes/:id)
router.put('/:id', async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedClass });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete Class (DELETE /api/classes/:id)
router.delete('/:id', async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;