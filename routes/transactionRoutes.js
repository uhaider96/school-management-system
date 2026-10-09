const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// 1. Record Expense Entry (POST /api/transactions/expense)
router.post('/expense', async (req, res) => {
    try {
        const { category, amount, description } = req.body;
        const newExpense = new Transaction({
            type: 'Expense',
            category,
            amount: Number(amount),
            description
        });
        const savedExpense = await newExpense.save();
        res.status(201).json({ success: true, data: savedExpense });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// 2. Financial Summary Report (GET /api/transactions/summary)
router.get('/summary', async (req, res) => {
    try {
        const summary = await Transaction.aggregate([
            {
                $group: {
                    _id: "$type",
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        let totalIncome = 0;
        let totalExpense = 0;

        summary.forEach(item => {
            if (item._id === 'Income') totalIncome = item.totalAmount;
            if (item._id === 'Expense') totalExpense = item.totalAmount;
        });

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                netBalance: totalIncome - totalExpense
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 3. Get All Transactions List (GET /api/transactions)
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;