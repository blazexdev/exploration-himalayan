const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET api/notifications
// @desc    Get unread notifications for the logged-in user
// @access  Private
router.get('/', authMiddleware, notificationController.getNotifications);

// @route   POST api/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.post('/:id/read', authMiddleware, notificationController.markAsRead);

// @route   POST api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.post('/read-all', authMiddleware, notificationController.markAllAsRead);

module.exports = router;
