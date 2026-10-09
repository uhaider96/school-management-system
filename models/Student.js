const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    grNo: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    scholarshipDiscountPercent: { type: Number, default: 0 },
    contactNumber: { type: String },
    address: { type: String },
    status: { type: String, enum: ['Active', 'Left'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);