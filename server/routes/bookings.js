const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// This route is now correctly protected and requires a user to be logged in
router.get('/', authMiddleware, bookingController.getBookings);
router.post('/', authMiddleware, bookingController.addBooking);
router.put('/:id/status', [authMiddleware, adminMiddleware], bookingController.updateBookingStatus);
router.delete('/:id', [authMiddleware, adminMiddleware], bookingController.deleteBooking);

module.exports = router;