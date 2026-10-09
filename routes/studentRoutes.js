const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// 1. Admit / Create Student (POST /api/students)
router.post('/', async (req, res) => {
    try {
        let studentData = { ...req.body };

        // Agar frontend se grNo na aaye ya khali ho, to Auto Generate karein
        if (!studentData.grNo || studentData.grNo.trim() === '') {
            // Generates unique format e.g. GR-2026-849201
            studentData.grNo = `GR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        }

        const newStudent = new Student(studentData);
        const savedStudent = await newStudent.save();
        
        res.status(201).json({ success: true, data: savedStudent });
    } catch (error) {
        // Duplicate key (E11000) error handling
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Duplicate entry detected. Please ensure the GR Number is unique.' 
            });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// 2. Get All Students (GET /api/students)
router.get('/', async (req, res) => {
    try {
        const students = await Student.find().populate('classId');
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/students/:id
router.put('/:id', async (req, res) => {
    try {
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: updatedStudent });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// DELETE /api/students/:id
router.delete('/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;