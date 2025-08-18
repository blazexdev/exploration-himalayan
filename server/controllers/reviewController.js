const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.getReviewsForTrek = async (req, res) => {
    try {
        const reviews = await Review.find({ trekId: req.params.trekId }).sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.addReview = async (req, res) => {
    const { trekId, rating, comment, mediaUrls } = req.body;
    const userId = req.user.id;

    try {
        const validBooking = await Booking.findOne({
            trekId: trekId,
            userEmail: req.user.email,
            status: 'Accepted'
        });

        if (!validBooking) {
            return res.status(403).json({ success: false, message: 'You can only review treks you have an accepted booking for.' });
        }

        const existingReview = await Review.findOne({ trekId, userId });
        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this trek.' });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const newReview = new Review({
            trekId,
            userId,
            userName: user.name,
            userImage: user.imageUrl,
            rating,
            comment,
            mediaUrls,
        });

        const review = await newReview.save();
        res.json({ success: true, review });

    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this trek.' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.updateReview = async (req, res) => {
    const { rating, comment, mediaUrls } = req.body;
    const { reviewId } = req.params;
    const userId = req.user.id;

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        const user = await User.findById(userId);
        if (review.userId.toString() !== userId && !user.isAdmin) {
            return res.status(401).json({ success: false, message: 'User not authorized.' });
        }

        review.rating = rating;
        review.comment = comment;
        review.mediaUrls = mediaUrls;

        const updatedReview = await review.save();
        res.json({ success: true, review: updatedReview });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.deleteReview = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;

    try {
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found.' });
        }

        const user = await User.findById(userId);
        if (review.userId.toString() !== userId && !user.isAdmin) {
            return res.status(401).json({ success: false, message: 'User not authorized.' });
        }

        // --- THIS IS THE FIX ---
        // .remove() is deprecated. Use findByIdAndDelete() instead.
        await Review.findByIdAndDelete(reviewId);
        
        res.json({ success: true, message: 'Review deleted successfully.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};