const Message = require('../models/Message');
const Notification = require('../models/Notification'); // Import Notification model
const User = require('../models/User');

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        const message = await newMessage.save();

        // Create notification for the recipient
        if (message.from === 'admin') {
            const user = await User.findOne({ email: message.to });
            if (user) {
                await Notification.create({
                    recipient: user._id.toString(),
                    message: `You have a new message from Admin.`,
                    link: '/contact'
                });
            }
        } else {
            await Notification.create({
                recipient: 'admin',
                message: `You have a new message from ${message.from}.`,
                link: '/admin'
            });
        }

        res.json(message);
    } catch (err) {
        res.status(500).send('Server error');
    }
};
