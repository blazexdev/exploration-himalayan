const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // This will automatically delete the document after 10 minutes
        expires: 600, // 600 seconds = 10 minutes
    },
});

module.exports = mongoose.model('Otp', OtpSchema);