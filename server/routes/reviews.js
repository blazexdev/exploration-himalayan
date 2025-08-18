const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, reviewController.addReview);
router.get('/:trekId', reviewController.getReviewsForTrek);
router.get('/', reviewController.getAllReviews);

// --- NEW: Routes for updating and deleting reviews ---
router.put('/:reviewId', authMiddleware, reviewController.updateReview);
router.delete('/:reviewId', authMiddleware, reviewController.deleteReview);

module.exports = router;