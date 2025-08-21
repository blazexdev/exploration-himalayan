// server/controllers/paymentController.js

const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Trek = require('../models/Trek');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const nodemailer = require('nodemailer');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay Key ID and Key Secret are required. Please check your server/.env file.');
}

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendInvoiceEmail = async (user, payment, booking) => {
    const mailOptions = {
        from: `"Exploration Himalayan" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `Payment Confirmation & Invoice for ${booking.trekName}`,
        html: `...` // Your styled invoice email
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Failed to send invoice email:", error);
    }
};

const sendProductInvoiceEmail = async (order) => {
    const mailOptions = {
        from: `"Exploration Himalayan" <${process.env.EMAIL_USER}>`,
        to: order.userEmail,
        subject: `Your Exploration Himalayan Order Confirmation #${order.orderId}`,
        html: `...` // Your styled product invoice email
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Failed to send product invoice email:", error);
    }
};

exports.createOrder = async (req, res) => {
    const { amount, bookingId, isProduct } = req.body;
    try {
        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
            notes: {
                bookingId: bookingId ? String(bookingId) : null,
                isProduct: isProduct || false,
            }
        };
        const order = await instance.orders.create(options);
        res.json({ success: true, order });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Could not create order." });
    }
};

exports.verifyNewBookingPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails, amount } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    try {
        const payment = await Payment.create({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            userEmail: bookingDetails.userEmail,
            userName: bookingDetails.name,
            trekId: bookingDetails.trekId,
            trekName: bookingDetails.trekName,
            amount: amount,
        });

        const newBooking = await Booking.create({
            ...bookingDetails,
            paymentId: payment._id,
            totalPrice: bookingDetails.totalPrice,
            amountPaid: amount / 100,
            paymentStatus: (amount / 100) >= bookingDetails.totalPrice ? 'Completed' : 'Partially Paid',
            status: 'Confirmed'
        });
        
        await sendInvoiceEmail({ name: newBooking.name, email: newBooking.email }, payment, newBooking);
        
        await Notification.create({
            recipient: 'admin',
            message: `${newBooking.name} paid ₹${(amount / 100)} for ${newBooking.trekName}.`,
            link: '/admin'
        });

        res.json({ success: true, message: "Payment successful!", booking: newBooking, payment: payment });
    } catch (dbError) {
        res.status(500).json({ success: false, message: "Failed to save booking record." });
    }
};

exports.verifyExistingBookingPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId, amount } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    try {
        const bookingToUpdate = await Booking.findById(bookingId);
        if (!bookingToUpdate) {
            return res.status(404).json({ success: false, message: "Booking record not found." });
        }

        const payment = await Payment.create({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            userEmail: bookingToUpdate.userEmail,
            userName: bookingToUpdate.name,
            trekId: bookingToUpdate.trekId,
            trekName: bookingToUpdate.trekName,
            amount: amount,
        });
        
        bookingToUpdate.amountPaid += (amount / 100);
        bookingToUpdate.paymentId = payment._id;
        
        if (bookingToUpdate.amountPaid >= bookingToUpdate.totalPrice) {
            bookingToUpdate.paymentStatus = 'Completed';
        } else {
            bookingToUpdate.paymentStatus = 'Partially Paid';
        }
        
        const finalBooking = await bookingToUpdate.save();
        await sendInvoiceEmail({ name: finalBooking.name, email: finalBooking.email }, payment, finalBooking);
        
        await Notification.create({
            recipient: 'admin',
            message: `${finalBooking.name} paid an additional ₹${(amount / 100)} for ${finalBooking.trekName}.`,
            link: '/admin'
        });

        res.json({ success: true, message: "Payment successful!", booking: finalBooking, payment: payment });
    } catch (dbError) {
        res.status(500).json({ success: false, message: "Failed to update booking record." });
    }
};

exports.verifyProductPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, product, amount, shippingDetails } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed." });
    }

    try {
        const payment = await Payment.create({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            userEmail: req.user.email,
            userName: req.user.name,
            amount: amount,
        });

        const newOrder = new Order({
            userId: req.user.id,
            userEmail: req.user.email,
            userName: req.user.name,
            products: [{ productId: product._id, name: product.name, price: product.price }],
            totalAmount: amount / 100,
            paymentId: payment._id,
            orderId: razorpay_order_id,
            shippingAddress: shippingDetails,
        });

        const savedOrder = await newOrder.save();
        await sendProductInvoiceEmail(savedOrder);

        await Notification.create({
            recipient: 'admin',
            message: `${savedOrder.userName} placed a new shop order for ₹${savedOrder.totalAmount}.`,
            link: '/admin'
        });
        
        res.json({ success: true, message: "Payment successful!", order: savedOrder, payment: payment });

    } catch (dbError) {
        res.status(500).json({ success: false, message: "Failed to save your order." });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
    }
};
