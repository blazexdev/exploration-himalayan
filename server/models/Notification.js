const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    // Can be a user's ObjectId or the string 'admin'
    recipient: { type: String, required: true }, 
    message: { type: String, required: true },
    // A hint for the frontend to navigate to the correct page
    link: { type: String, required: true }, 
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
