const Booking = require('../models/Booking');

exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.addBooking = async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        const booking = await newBooking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// --- NEW: Function to delete a booking ---
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndRemove(req.params.id);
        if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });
        res.json({ success: true, msg: 'Booking deleted successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};