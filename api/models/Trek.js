const mongoose = require('mongoose');

const ItinerarySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
});

const TrekSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },
    difficulty: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    itinerary: [ItinerarySchema],
    locationPhotos: { type: [String], default: [] },
    // --- NEW FIELDS ---
    isUpcoming: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false }
});

module.exports = mongoose.model('Trek', TrekSchema);