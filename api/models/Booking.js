const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    trekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trek', required: true },
    trekName: { type: String, required: true },
    userEmail: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: String, required: true },
    status: { type: String, default: 'New' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: false }, 
    paymentStatus: { type: String, default: 'Pending' },
    // --- NEW FIELDS ---
    totalPrice: { type: Number, required: true }, // Store the full price of the trek at booking time
    amountPaid: { type: Number, default: 0 }
});

module.exports = mongoose.model('Booking', BookingSchema);