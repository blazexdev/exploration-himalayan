const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/orders
// @desc    Get all orders for admin or user's own orders
// @access  Private
router.get('/', authMiddleware, orderController.getOrders);

module.exports = router;