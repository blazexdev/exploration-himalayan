const Message = require('../models/Message');

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
        res.json(message);
    } catch (err) {
        res.status(500).send('Server error');
    }
};