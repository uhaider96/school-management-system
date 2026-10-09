const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    month: {
        type: String, // e.g., "October 2026"
        required: true
    },
    tuitionFee: {
        type: Number,
        required: true
    },
    otherCharges: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Partial'],
        default: 'Unpaid'
    },
    paidDate: {
        type: Date
    },
    dueDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);