const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all unread notifications for the current user or admin
exports.getNotifications = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const recipientId = user.isAdmin ? 'admin' : req.user.id;

        const notifications = await Notification.find({ recipient: recipientId }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
