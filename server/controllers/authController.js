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
        html: `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png" alt="Exploration Himalayan Logo" style="max-width: 150px;">
            <h1 style="color: #0d9488;">Exploration Himalayan</h1>
        </div>
        <h2 style="color: #333;">Verify Your Action</h2>
        <p>Hello,</p>
        <p>Please use the following One-Time Password (OTP) to proceed. This code is valid for the next 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 10px; padding: 10px 20px; background-color: #f1f5f9; border-radius: 5px; color: #0d9488;">
                ${otp}
            </span>
        </div>
        <p>If you did not request this code, you can safely ignore this email.</p>
        <p>Happy trekking,<br>The Exploration Himalayan Team</p>
    </div>
</div>
        `,
    };
    await transporter.sendMail(mailOptions);
};

const sendWelcomeEmail = async (name, email) => {
    const mailOptions = {
        from: `"Exploration Himalayan" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to Exploration Himalayan!',
        html: `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png" alt="Exploration Himalayan Logo" style="max-width: 150px;">
            <h1 style="color: #0d9488;">Welcome Aboard!</h1>
        </div>
        <h2 style="color: #333;">Hi ${name},</h2>
        <p>We are thrilled to welcome you to the <strong>Exploration Himalayan</strong> community! Your account has been successfully created, and a world of adventure awaits.</p>
        <p>You can now browse our exclusive treks, manage your bookings, and get in touch with our team directly from your dashboard.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000" style="background-color: #0d9488; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Treks Now</a>
        </div>
        <p>If you have any questions, feel free to reply to this email or use the chat feature on our website.</p>
        <p>The mountains are calling,<br>The Exploration Himalayan Team</p>
    </div>
</div>
        `,
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
        html: `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png" alt="Exploration Himalayan Logo" style="max-width: 150px;">
            <h1 style="color: #0d9488;">Password Reset Request</h1>
        </div>
        <h2 style="color: #333;">Hi ${name},</h2>
        <p>We received a request to reset the password for your account. Please use the following One-Time Password (OTP) to set a new password. This code is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 10px; padding: 10px 20px; background-color: #f1f5f9; border-radius: 5px; color: #0d9488;">
                ${otp}
            </span>
        </div>
        <p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        <p>Happy trekking,<br>The Exploration Himalayan Team</p>
    </div>
</div>
        `,
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
