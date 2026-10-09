const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');

// 1. Get All Fee Records (with optional status/class filter)
router.get('/', async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate('studentId', 'fullName grNo phone')
            .populate('classId', 'className section')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: fees });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 2. Generate Bulk Vouchers for a Class
router.post('/generate-class-vouchers', async (req, res) => {
    try {
        const { classId, month, dueDate, tuitionFee } = req.body;

        // Find all students in this class
        const students = await Student.find({ classId });

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Is class mein koi student nahi mila.' });
        }

        const vouchersToCreate = students.map(student => ({
            studentId: student._id,
            classId: classId,
            month,
            tuitionFee: tuitionFee || 0,
            otherCharges: 0,
            totalAmount: tuitionFee || 0,
            dueDate: new Date(dueDate),
            status: 'Unpaid'
        }));

        const createdVouchers = await Fee.insertMany(vouchersToCreate);
        res.status(201).json({ success: true, message: `${createdVouchers.length} Vouchers generated successfully!` });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// 3. Mark Fee as Paid
router.put('/:id/pay', async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(
            req.params.id,
            { status: 'Paid', paidDate: new Date() },
            { new: true }
        );
        res.status(200).json({ success: true, data: fee });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;