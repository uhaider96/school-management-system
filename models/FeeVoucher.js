const mongoose = require('mongoose');

const feeVoucherSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    monthYear: { type: String, required: true }, // e.g., "2026-10"
    dueDate: { type: Date, required: true },
    tuitionFee: { type: Number, required: true },
    transportFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Unpaid', 'Partial', 'Paid'], default: 'Unpaid' },
    paymentDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('FeeVoucher', feeVoucherSchema);