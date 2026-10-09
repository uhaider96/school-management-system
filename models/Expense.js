const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Utility Bill', 'Salaries', 'Maintenance', 'Stationery', 'Rent', 'Other'],
        default: 'Other'
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);