const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    trekId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trek', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userImage: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    mediaUrls: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now }
});

// Prevent a user from reviewing the same trek more than once
ReviewSchema.index({ trekId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);