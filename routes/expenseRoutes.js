const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// Get all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ date: -1 });
        res.status(200).json({ success: true, data: expenses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add new expense
router.post('/', async (req, res) => {
    try {
        const { title, category, amount, date, description } = req.body;
        const newExpense = new Expense({
            title,
            category,
            amount: Number(amount),
            date: date || new Date(),
            description
        });
        await newExpense.save();
        res.status(201).json({ success: true, data: newExpense });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete expense
router.delete('/:id', async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;