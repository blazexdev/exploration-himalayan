const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify-new-booking-payment', authMiddleware, paymentController.verifyNewBookingPayment);
router.post('/verify-existing-booking-payment', authMiddleware, paymentController.verifyExistingBookingPayment);

// --- NEW: Route for product payments ---
router.post('/verify-product-payment', authMiddleware, paymentController.verifyProductPayment);

router.get('/', authMiddleware, paymentController.getPayments);

module.exports = router;