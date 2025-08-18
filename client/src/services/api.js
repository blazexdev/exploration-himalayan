import axios from 'axios';

const API = axios.create({ baseURL: 'https://exploration-himalayan-server.onrender.com' });

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Auth
const loadUser = () => API.get('/auth/user'); 
const login = (email, password) => API.post('/auth/login', { email, password });
const requestSignupOtp = (email) => API.post('/auth/request-signup-otp', { email });
const verifyOtpAndSignup = (data) => API.post('/auth/verify-otp-and-signup', data);
const requestLoginOtp = (email) => API.post('/auth/request-login-otp', { email });
const verifyLoginOtp = (data) => API.post('/auth/verify-login-otp', data);
const googleSignIn = (token) => API.post('/auth/google-signin', { token });
const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
const resetPassword = (data) => API.post('/auth/reset-password', data);
const updateProfile = (profileData) => API.put('/auth/profile', profileData);
const changePassword = (passwordData) => API.put('/auth/change-password', passwordData);
const getUsers = () => API.get('/auth/users');
const manageAdminStatus = (email, makeAdmin) => API.post('/auth/manage-admin', { email, makeAdmin });

// Treks
const getTreks = () => API.get('/treks');
const addTrek = (trekData) => API.post('/treks', trekData);
const updateTrek = (id, trekData) => API.put(`/treks/${id}`, trekData);
const deleteTrek = (id) => API.delete(`/treks/${id}`);

// Bookings
const getBookings = () => API.get('/bookings');
const addBooking = (bookingData) => API.post('/bookings', bookingData);
const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
const deleteBooking = (id) => API.delete(`/bookings/${id}`);

// Messages
const getMessages = () => API.get('/messages');
const sendMessage = (messageData) => API.post('/messages', messageData);

// Payments
const createRazorpayOrder = (amount, bookingId, isProduct) => API.post('/payments/create-order', { amount, bookingId, isProduct });
const verifyNewBookingPayment = (paymentData) => API.post('/payments/verify-new-booking-payment', paymentData);
const verifyExistingBookingPayment = (paymentData) => API.post('/payments/verify-existing-booking-payment', paymentData);
const verifyProductPayment = (paymentData) => API.post('/payments/verify-product-payment', paymentData);
const getPayments = () => API.get('/payments');

// Reviews
const addReview = (reviewData) => API.post('/reviews', reviewData);
const getReviewsForTrek = (trekId) => API.get(`/reviews/${trekId}`);
const getAllReviews = () => API.get('/reviews');
const updateReview = (reviewId, reviewData) => API.put(`/reviews/${reviewId}`, reviewData);
const deleteReview = (reviewId) => API.delete(`/reviews/${reviewId}`);

// Products
const getProducts = () => API.get('/products');
const addProduct = (productData) => API.post('/products', productData);
const updateProduct = (id, productData) => API.put(`/products/${id}`, productData);
const deleteProduct = (id) => API.delete(`/products/${id}`);
const addProductReview = (id, reviewData) => API.post(`/products/${id}/reviews`, reviewData);
const updateProductReview = (productId, reviewId, reviewData) => API.put(`/products/${productId}/reviews/${reviewId}`);
const deleteProductReview = (productId, reviewId) => API.delete(`/products/${productId}/reviews/${reviewId}`);

// Orders
const getOrders = () => API.get('/orders');

const api = {
    loadUser,
    login,
    requestSignupOtp,
    verifyOtpAndSignup,
    requestLoginOtp,
    verifyLoginOtp,
    googleSignIn,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    getUsers,
    manageAdminStatus,
    getTreks,
    addTrek,
    updateTrek,
    deleteTrek,
    getBookings,
    addBooking,
    updateBookingStatus,
    deleteBooking,
    getMessages,
    sendMessage,
    createRazorpayOrder,
    verifyNewBookingPayment,
    verifyExistingBookingPayment,
    verifyProductPayment,
    getPayments,
    addReview,
    getReviewsForTrek,
    getAllReviews,
    updateReview,
    deleteReview,
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    addProductReview,
    updateProductReview,
    deleteProductReview,
    getOrders,
};

export default api;
