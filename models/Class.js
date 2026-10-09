const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    className: { type: String, required: true }, // e.g., "Class 9"
    section: { type: String, required: true },   // e.g., "A"
    monthlyTuitionFee: { type: Number, required: true, default: 0 },
    transportFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);