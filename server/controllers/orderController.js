const Order = require('../models/Order');
const User = require('../models/User');

exports.getOrders = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let orders;
        if (user.isAdmin) {
            // If user is an admin, fetch all orders
            orders = await Order.find().sort({ createdAt: -1 });
        } else {
            // Otherwise, fetch only the orders for the logged-in user
            orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        }
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};