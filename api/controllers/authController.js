const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: `"Exploration Himalayan" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code for Exploration Himalayan',
        html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This code is valid for 10 minutes.</p>`,
    };
    await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (name, email) => {
    const mailOptions = {
        from: `"Exploration Himalayan" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Exploration Himalayan!',
        html: `<p>Hi ${name}, welcome to Exploration Himalayan!</p>`,
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Failed to send welcome email:", error);
    }
};

const sendPasswordResetEmail = async (name, email, otp) => {
    const mailOptions = {
        from: `"Exploration Himalayan" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Password Reset Code',
        html: `<p>Hi ${name}, your password reset OTP is: <strong>${otp}</strong></p>`,
    };
    await transporter.sendMail(mailOptions);
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: true, message: 'If an account with that email exists, a password reset OTP has been sent.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({ email, otp });
        await sendPasswordResetEmail(user.name, email, otp);
        res.json({ success: true, message: 'If an account with that email exists, a password reset OTP has been sent.' });
    } catch (err) {
        console.error("Error in forgotPassword:", err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        await Otp.deleteOne({ _id: otpRecord._id });
        res.json({ success: true, message: 'Password has been reset successfully. You can now log in with your new password.' });
    } catch (err) {
        console.error("Error in resetPassword:", err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};

exports.googleSignIn = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();
        let user = await User.findOne({ email });
        if (!user) {
            const dummyPassword = email + process.env.JWT_SECRET;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(dummyPassword, salt);
            user = new User({ name, email, password: hashedPassword, imageUrl: picture });
            await user.save();
            await sendWelcomeEmail(name, email);
        }
        const payload = { user: { id: user.id, name: user.name, email: user.email } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, jwtToken) => {
            if (err) throw err;
            const { password, ...userData } = user._doc;
            res.json({ success: true, token: jwtToken, user: userData });
        });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Google Sign-In failed. Please try again.' });
    }
};

exports.requestLoginOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({ email, otp });
        await sendOtpEmail(email, otp);
        res.json({ success: true, message: 'OTP sent to your email successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error while sending OTP.' });
    }
};

exports.verifyLoginOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        await Otp.deleteOne({ _id: otpRecord._id });
        const payload = { user: { id: user.id, name: user.name, email: user.email } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            const { password, ...userData } = user._doc;
            res.json({ success: true, token, user: userData });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during OTP login.' });
    }
};

exports.requestSignupOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({ email, otp });
        await sendOtpEmail(email, otp);
        res.json({ success: true, message: 'OTP sent to your email successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error while sending OTP.' });
    }
};

exports.verifyOtpAndSignup = async (req, res) => {
    const { name, email, password, otp } = req.body;
    try {
        const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        await sendWelcomeEmail(name, email);
        await Otp.deleteOne({ _id: otpRecord._id });
        const payload = { user: { id: user.id, name: user.name, email: user.email } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            const { password, ...userData } = user._doc;
            res.json({ success: true, token, user: userData });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error during signup.' });
    }
};

exports.manageAdminStatus = async (req, res) => {
    const { email, makeAdmin } = req.body;
    try {
        const userToUpdate = await User.findOne({ email });
        if (!userToUpdate) return res.status(404).json({ success: false, message: 'User not found.' });
        userToUpdate.isAdmin = makeAdmin;
        await userToUpdate.save();
        const action = makeAdmin ? 'granted' : 'revoked';
        res.json({ success: true, message: `Admin privileges have been ${action} for ${email}.` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error while updating admin status.' });
    }
};

exports.getLoggedInUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
        const payload = { user: { id: user.id, name: user.name, email: user.email } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            const { password, ...userData } = user._doc;
            res.json({ success: true, token, user: userData });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    const { email, ...profileData } = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate({ email }, profileData, { new: true }).select('-password');
        if (!updatedUser) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.changePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect old password' });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};