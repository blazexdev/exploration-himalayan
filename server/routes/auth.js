const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// --- NEW ROUTES for Forgot/Reset Password ---
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// --- Existing Routes ---
router.post('/google-signin', authController.googleSignIn);
router.post('/request-login-otp', authController.requestLoginOtp);
router.post('/verify-login-otp', authController.verifyLoginOtp);
router.post('/request-signup-otp', authController.requestSignupOtp);
router.post('/verify-otp-and-signup', authController.verifyOtpAndSignup);
router.post('/manage-admin', [authMiddleware, adminMiddleware], authController.manageAdminStatus);
router.get('/user', authMiddleware, authController.getLoggedInUser);
router.post('/login', authController.login);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);
router.get('/users', authController.getUsers);

module.exports = router;