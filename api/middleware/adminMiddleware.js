const User = require('../models/User');

module.exports = async function (req, res, next) {
    try {
        // We assume authMiddleware has already run and attached req.user
        const user = await User.findById(req.user.id);

        if (user && user.isAdmin) {
            next(); // User is an admin, proceed
        } else {
            res.status(403).json({ msg: 'Access denied. Not an admin.' });
        }
    } catch (err) {
        res.status(500).send('Server Error');
    }
};