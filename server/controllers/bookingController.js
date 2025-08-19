const Booking = require('../models/Booking');
const Notification = require('../models/Notification'); // Import Notification model
const User = require('../models/User');

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

        // Create notification for admin
        await Notification.create({
            recipient: 'admin',
            message: `${booking.name} has submitted a new booking for ${booking.trekName}.`,
            link: '/admin'
        });

        res.json(booking);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });

        // Create notification for the user
        const user = await User.findOne({ email: booking.userEmail });
        if (user) {
            await Notification.create({
                recipient: user._id.toString(),
                message: `Your booking for ${booking.trekName} has been ${booking.status.toLowerCase()}.`,
                link: '/dashboard'
            });
        }

        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).send('Server error');
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndRemove(req.params.id);
        if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });
        res.json({ success: true, msg: 'Booking deleted successfully' });
    } catch (err) {
        res.status(500).send('Server error');
    }
};
