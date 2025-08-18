const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    type: { type: String, default: 'text' },
    content: { type: String, required: true },
    fileName: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);