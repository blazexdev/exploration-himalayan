const express = require('express');
const router = express.Router();

// Import all your individual route files
router.use('/auth', require('./auth'));
router.use('/treks', require('./treks'));
router.use('/bookings', require('./bookings'));
router.use('/messages', require('./messages'));
router.use('/payments', require('./payments'));
router.use('/reviews', require('./reviews'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));

module.exports = router;