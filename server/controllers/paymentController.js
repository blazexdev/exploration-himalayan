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
        html: `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png" alt="Logo" style="max-width: 150px;">
        <h1 style="color: #0d9488;">Invoice & Booking Confirmation</h1>
    </div>
    <p>Hi ${user.name},</p>
    <p>Thank you for your payment! Your booking for the <strong>${booking.trekName}</strong> trek is now updated.</p>
    
    <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Payment Details</h3>
    <p><strong>Payment ID:</strong> ${payment.razorpay_payment_id}</p>
    <p><strong>Order ID:</strong> ${payment.razorpay_order_id}</p>
    <p><strong>Amount Paid:</strong> ₹${(payment.amount / 100).toLocaleString('en-IN')}</p>
    <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString('en-IN')}</p>

    <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Booking Details</h3>
    <p><strong>Trek:</strong> ${booking.trekName}</p>
    <p><strong>Trek Date:</strong> ${booking.date}</p>
    <p><strong>Total Paid:</strong> ₹${booking.amountPaid.toLocaleString('en-IN')} / ₹${booking.totalPrice.toLocaleString('en-IN')}</p>
    <p><strong>Status:</strong> ${booking.status}</p>

    <p>We're excited to have you with us. We will be in touch with more details about your upcoming adventure.</p>
    <p>The Exploration Himalayan Team</p>
</div>
        `,
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
        html: `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px;">
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png" alt="Logo" style="max-width: 150px;">
        <h1 style="color: #0d9488;">Thank You for Your Order!</h1>
    </div>
    <p>Hi ${order.userName},</p>
    <p>We've received your order and are getting it ready for shipment. Here are the details:</p>
    
    <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Order Summary</h3>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Payment ID:</strong> ${order.paymentId}</p>
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead style="background-color: #f1f5f9;">
            <tr>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Price</th>
            </tr>
        </thead>
        <tbody>
            ${order.products.map(p => `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;">${p.name}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">₹${p.price.toLocaleString('en-IN')}</td>
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>Total:</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>₹${order.totalAmount.toLocaleString('en-IN')}</strong></td>
            </tr>
        </tfoot>
    </table>

    <h3 style="border-bottom: 2px solid #eee; padding-bottom: 5px;">Shipping Address</h3>
    <p>
        ${order.shippingAddress.name}<br>
        ${order.shippingAddress.address}<br>
        ${order.shippingAddress.phone}
    </p>

    <p>We'll notify you again once your order has shipped. If you have any questions, please reply to this email.</p>
    <p>The Exploration Himalayan Team</p>
</div>
        `,
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
