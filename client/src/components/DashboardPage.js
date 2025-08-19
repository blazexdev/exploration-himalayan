// client/src/components/DashboardPage.js

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Modal from './Modal';
import api from '../services/api';
import Pagination from './Pagination';

const icons = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>,
    camera: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>,
};

const ITEMS_PER_PAGE = 5;

const DashboardPage = ({ bookings = [], payments = [], orders = [], currentUser, onUpdateProfile, onChangePassword, onBookingUpdate, onPaymentFailure, setPage }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [profileData, setProfileData] = useState({ name: '', age: '', address: '', gender: '', phone: '', imageUrl: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentPage, setPaymentPage] = useState(1);
    const [orderPage, setOrderPage] = useState(1);

    useEffect(() => {
        if (currentUser) {
            setProfileData({
                name: currentUser.name || '',
                age: currentUser.age || '',
                address: currentUser.address || '',
                gender: currentUser.gender || '',
                phone: currentUser.phone || '',
                imageUrl: currentUser.imageUrl || ''
            });
        }
    }, [currentUser]);

    const userPayments = useMemo(() => 
        payments.filter(p => p && p.userEmail === currentUser?.email), 
        [payments, currentUser]
    );

    const paginatedPayments = useMemo(() =>
        userPayments.slice((paymentPage - 1) * ITEMS_PER_PAGE, paymentPage * ITEMS_PER_PAGE),
        [userPayments, paymentPage]
    );
    const totalPaymentPages = Math.ceil(userPayments.length / ITEMS_PER_PAGE);
    
    const userOrders = useMemo(() => 
        orders.filter(o => o && o.userEmail === currentUser?.email),
        [orders, currentUser]
    );

    const paginatedOrders = useMemo(() =>
        userOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE),
        [userOrders, orderPage]
    );
    const totalOrderPages = Math.ceil(userOrders.length / ITEMS_PER_PAGE);

    const userBookings = useMemo(() => 
        bookings.filter(b => b && b.userEmail === currentUser?.email),
        [bookings, currentUser]
    );

    if (!currentUser) {
        return <div className="container mx-auto p-8 text-center">Please log in to view your dashboard.</div>;
    }

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        const response = await onUpdateProfile(currentUser.email, profileData);
        if (response.success) {
            setMessage('Profile updated successfully!');
            setIsEditMode(false);
        } else {
            setMessage(response.message || 'Error updating profile.');
        }
        setTimeout(() => setMessage(''), 3000);
    };
    
    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('New passwords do not match.');
            setTimeout(() => setMessage(''), 3000);
            return;
        }
        const response = await onChangePassword(currentUser.email, passwordData.oldPassword, passwordData.newPassword);
        setMessage(response.message);
        if (response.success) {
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({...prev, imageUrl: reader.result}));
            };
            reader.readAsDataURL(file);
        }
    };

    const openPaymentModal = (booking) => {
        setSelectedBooking(booking);
        setPaymentAmount(booking.totalPrice - booking.amountPaid);
        setIsPaymentModalOpen(true);
    };

    const closePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedBooking(null);
        setPaymentAmount('');
        setPaymentError('');
    };

    const handlePayLater = async (e) => {
        e.preventDefault();
        setPaymentError('');
        if (!paymentAmount || Number(paymentAmount) <= 0) {
            setPaymentError('Please enter a valid amount.');
            return;
        }
        if (Number(paymentAmount) > (selectedBooking.totalPrice - selectedBooking.amountPaid)) {
            setPaymentError('Amount cannot be greater than the remaining balance.');
            return;
        }

        setIsLoading(true);
        try {
            const { data: { order } } = await api.createRazorpayOrder(paymentAmount, selectedBooking._id);
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: "Exploration Himalayan",
                description: `Payment for ${selectedBooking.trekName}`,
                image: "https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png",
                order_id: order.id,
                handler: async function (response) {
                    const paymentData = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: order.amount,
                        bookingId: selectedBooking._id
                    };
                    
                    const { data } = await api.verifyExistingBookingPayment(paymentData);
                    if (data.success) {
                        // --- FIX: Pass both the booking and the payment to the handler ---
                        onBookingUpdate(data.booking, data.payment);
                        closePaymentModal();
                    } else {
                        onPaymentFailure('Payment verification failed.');
                    }
                },
                prefill: { name: currentUser.name, email: currentUser.email, contact: currentUser.phone || '' },
                theme: { color: "#0d9488" },
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response){
                onPaymentFailure(response.error.description);
            });
            rzp.open();
        } catch (error) {
            onPaymentFailure('Failed to initiate payment.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Accepted':
            case 'Confirmed':
                return 'bg-green-500';
            case 'Rejected':
                return 'bg-red-500';
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <div className="container mx-auto px-6 py-12 animate-fade-in">
            <div className="flex items-center space-x-4 mb-8">
                <span className="text-teal-500 dark:text-teal-400 w-10 h-10">{icons.dashboard}</span>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
            </div>
            
            {message && <div className="bg-teal-500/20 text-teal-300 p-3 rounded-lg mb-6 text-center">{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h2>
                    <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                            <img 
                                src={profileData.imageUrl || `https://placehold.co/128x128/e2e8f0/4a5568?text=${profileData.name ? profileData.name.charAt(0) : 'U'}`} 
                                alt="Profile" 
                                className="w-32 h-32 rounded-full object-cover border-4 border-teal-500"
                            />
                            {isEditMode && (
                                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 bg-gray-200 dark:bg-gray-700 p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                    <span className="w-5 h-5 text-gray-800 dark:text-white">{icons.camera}</span>
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
                        </div>
                        
                        {!isEditMode ? (
                            <>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">{profileData.phone}</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">{profileData.address}</p>
                                <button onClick={() => setIsEditMode(true)} className="mt-4 bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300">Edit Profile</button>
                            </>
                        ) : (
                            <form onSubmit={handleProfileSave} className="w-full space-y-4 mt-4">
                                <input type="text" name="name" placeholder="Your Name" value={profileData.name} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" />
                                <input type="tel" name="phone" placeholder="Phone Number" value={profileData.phone} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" />
                                <input type="number" name="age" placeholder="Age" value={profileData.age} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" />
                                <textarea name="address" placeholder="Address" value={profileData.address} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" rows="3"></textarea>
                                <select name="gender" value={profileData.gender} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                </select>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setIsEditMode(false)} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600">Cancel</button>
                                    <button type="submit" className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Save</button>
                                </div>
                            </form>
                        )}
                    </div>
                    
                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordSave} className="space-y-4">
                             <input type="password" name="oldPassword" placeholder="Current Password" value={passwordData.oldPassword} onChange={handlePasswordChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                             <input type="password" name="newPassword" placeholder="New Password" value={passwordData.newPassword} onChange={handlePasswordChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                             <input type="password" name="confirmPassword" placeholder="Confirm New Password" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                             <button type="submit" className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600">Update Password</button>
                        </form>
                        <button 
                            onClick={() => setPage({ name: 'login', state: 'forgotPassword' })} 
                            className="w-full text-center text-sm text-gray-500 hover:underline mt-4"
                        >
                            Forgot your password?
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-3xl font-bold mb-6">My Bookings</h2>
                        {userBookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-4 font-semibold">Trek</th><th className="p-4 font-semibold">Date</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Payment</th><th className="p-4 font-semibold">Action</th></tr></thead>
                                    <tbody>
                                        {userBookings.map(booking => (
                                            <tr key={booking._id} className="border-b dark:border-gray-700">
                                                <td className="p-4">{booking.trekName}</td>
                                                <td className="p-4">{booking.date}</td>
                                                <td className="p-4"><span className={`text-white px-2 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>{booking.status}</span></td>
                                                <td className="p-4">{booking.paymentStatus} (₹{booking.amountPaid}/{booking.totalPrice})</td>
                                                <td className="p-4">
                                                    {booking.paymentStatus !== 'Completed' && booking.status !== 'Rejected' && (
                                                        <button onClick={() => openPaymentModal(booking)} className="bg-blue-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-blue-700">Pay Now</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">You have no bookings yet.</p>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-3xl font-bold mb-6">My Shop Orders</h2>
                        {userOrders.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-4 font-semibold">Order ID</th><th className="p-4 font-semibold">Products</th><th className="p-4 font-semibold">Amount</th><th className="p-4 font-semibold">Date</th></tr></thead>
                                    <tbody>
                                        {paginatedOrders.map(order => (
                                            <tr key={order._id} className="border-b dark:border-gray-700">
                                                <td className="p-4 text-sm truncate" title={order.orderId}>{order.orderId}</td>
                                                <td className="p-4">{order.products.map(p => p.name).join(', ')}</td>
                                                <td className="p-4">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                                                <td className="p-4">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination currentPage={orderPage} totalPages={totalOrderPages} onPageChange={setOrderPage} />
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">You have no shop orders.</p>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                        <h2 className="text-3xl font-bold mb-6">My Payments</h2>
                        {userPayments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-4 font-semibold">Payment ID</th><th className="p-4 font-semibold">Item</th><th className="p-4 font-semibold">Amount</th><th className="p-4 font-semibold">Date</th></tr></thead>
                                    <tbody>
                                        {paginatedPayments.map(payment => (
                                            <tr key={payment._id} className="border-b dark:border-gray-700">
                                                <td className="p-4 text-sm truncate" title={payment.razorpay_payment_id}>{payment.razorpay_payment_id}</td>
                                                <td className="p-4">{payment.trekName || 'Shop Order'}</td>
                                                <td className="p-4">₹{(payment.amount / 100).toLocaleString('en-IN')}</td>
                                                <td className="p-4">{new Date(payment.createdAt).toLocaleDateString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Pagination currentPage={paymentPage} totalPages={totalPaymentPages} onPageChange={setPaymentPage} />
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400">You have no payment history.</p>
                        )}
                    </div>
                </div>
            </div>
            <Modal isOpen={isPaymentModalOpen} onClose={closePaymentModal}>
                {selectedBooking && (
                    <form onSubmit={handlePayLater}>
                        <h2 className="text-2xl font-bold text-center mb-4">Complete Your Payment</h2>
                        <p className="text-center mb-2"><strong>Trek:</strong> {selectedBooking.trekName}</p>
                        <p className="text-center mb-4"><strong>Remaining Amount:</strong> ₹{(selectedBooking.totalPrice - selectedBooking.amountPaid).toLocaleString('en-IN')}</p>
                        
                        <div className="my-4">
                            <label htmlFor="paymentAmountModal" className="block font-bold mb-2">Amount to Pay (INR)</label>
                            <input 
                                type="number" 
                                name="paymentAmountModal"
                                id="paymentAmountModal"
                                placeholder="Enter amount" 
                                value={paymentAmount} 
                                onChange={(e) => setPaymentAmount(e.target.value)} 
                                className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" 
                                max={selectedBooking.totalPrice - selectedBooking.amountPaid}
                                required 
                            />
                        </div>

                        {paymentError && <p className="text-red-500 text-sm text-center mb-4">{paymentError}</p>}
                        
                        <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">
                            {isLoading ? 'Processing...' : `Pay ₹${paymentAmount || 0}`}
                        </button>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default DashboardPage;
