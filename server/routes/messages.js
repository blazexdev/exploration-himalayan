const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// These routes are now correctly protected and require a user to be logged in
router.get('/', authMiddleware, messageController.getMessages);
router.post('/', authMiddleware, messageController.sendMessage);

module.exports = router;