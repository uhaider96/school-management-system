const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['Income', 'Expense'], required: true },
    category: { type: String, required: true }, // e.g. "Student Fee", "Salary", "Utility Bill"
    amount: { type: Number, required: true },
    description: { type: String },
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeVoucher' }, // Null if expense
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);