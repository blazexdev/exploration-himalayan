const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    razorpay_payment_id: { type: String, required: true },
    razorpay_order_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    trekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trek', required: true },
    trekName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', PaymentSchema);