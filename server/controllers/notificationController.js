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

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        
        // Ensure the user is the recipient
        const user = await User.findById(req.user.id);
        const recipientId = user.isAdmin ? 'admin' : req.user.id;
        if (notification.recipient !== recipientId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const recipientId = user.isAdmin ? 'admin' : req.user.id;

        await Notification.updateMany({ recipient: recipientId, isRead: false }, { $set: { isRead: true } });
        res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
