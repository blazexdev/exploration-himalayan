// client/src/App.js
// --- CORRECTED FILE ---

import React, { useState, useEffect } from 'react';
import api from './services/api';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import TreksPage from './components/TreksPage';
import TrekDetailPage from './components/TrekDetailPage';
import DashboardPage from './components/DashboardPage';
import AuthPage from './components/AuthPage';
import AdminPanel from './components/AdminPanel';
import ContactPage from './components/ContactPage';
import StaticPage from './components/StaticPage';
import LoadingScreen from './components/LoadingScreen';
import ChatWindow from './components/ChatWindow';
import ShopPage from './components/ShopPage';
import ProductDetailPage from './components/ProductDetailPage';
import NotificationBell from './components/NotificationBell';
import PaymentStatusModal from './components/PaymentStatusModal'; // New import

const AboutUsPage = () => <StaticPage title="About Us"><p>Welcome to Exploration Himalayan! We are passionate about sharing the breathtaking beauty of the Himalayas with adventurers from around the world...</p></StaticPage>;
const PrivacyPolicyPage = () => <StaticPage title="Privacy Policy"><p>Your privacy is important to us...</p></StaticPage>;
const CancellationPolicyPage = () => <StaticPage title="Cancellation Policy"><p>We understand that plans can change...</p></StaticPage>;
const TermsPage = () => <StaticPage title="Terms and Conditions"><p>By booking a trek with us, you agree to the following terms...</p></StaticPage>;
const FAQPage = () => <StaticPage title="Frequently Asked Questions"><div><h3 className="text-xl font-bold text-teal-500">What is the best time to trek?</h3><p>The pre-monsoon (March-May) and post-monsoon (Sept-Nov) seasons are ideal.</p></div></StaticPage>;

const WHATSAPP_NUMBER = "7876234732";

export default function App() {
    const [page, setPage] = useState({ name: 'home' });
    const [treks, setTreks] = useState([]);
    const [products, setProducts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState({ show: false, status: '', message: '' });

    useEffect(() => {
        const fetchNotifications = async () => {
            if (localStorage.getItem('token')) {
                try {
                    const res = await api.getNotifications();
                    setNotifications(res.data);
                } catch (err) {
                    console.error("Could not fetch notifications");
                }
            }
        };
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Poll every 15 seconds
        return () => clearInterval(interval);
    }, [currentUser]); // Refetch when user logs in/out

    const handleNotificationUpdate = (updatedNotification) => {
        if (updatedNotification) {
            setNotifications(prev => prev.map(n => n._id === updatedNotification._id ? updatedNotification : n));
        } else {
            // If null is passed, refetch all notifications (used for mark all as read)
            api.getNotifications().then(res => setNotifications(res.data));
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    useEffect(() => {
        const initializeApp = async () => {
            setIsLoading(true);
            
            const token = localStorage.getItem('token');
            let loggedInUser = null;
            if (token) {
                try {
                    const userRes = await api.loadUser();
                    if (userRes.data.success) {
                        loggedInUser = userRes.data.user;
                        setCurrentUser(loggedInUser);
                        if (loggedInUser.isAdmin) {
                            setIsAdmin(true);
                        }
                    }
                } catch (err) {
                    console.error("Session expired or invalid:", err);
                    localStorage.removeItem('token');
                }
            }

            try {
                const [treksRes, reviewsRes, productsRes] = await Promise.all([
                    api.getTreks(),
                    api.getAllReviews(),
                    api.getProducts()
                ]);
                setTreks(Array.isArray(treksRes.data) ? treksRes.data : []);
                setReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
                setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);

                if (loggedInUser) {
                    const [bookingsRes, messagesRes, usersRes, paymentsRes, ordersRes] = await Promise.all([
                        api.getBookings(),
                        api.getMessages(),
                        api.getUsers(),
                        api.getPayments(),
                        api.getOrders()
                    ]);
                    setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
                    setMessages(Array.isArray(messagesRes.data) ? messagesRes.data : []);
                    setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
                    setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
                    setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
                }
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        initializeApp();
    }, []);

    useEffect(() => {
        if (!currentUser) return;

        const interval = setInterval(async () => {
            try {
                const res = await api.getMessages();
                setMessages(res.data);
            } catch (error) {
                console.error("Failed to poll for new messages:", error);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentUser]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark');
    };

    const handleFloatingButtonClick = () => {
        if (isChatOpen) {
            setIsChatOpen(false);
            return;
        }
        setIsChatPopupOpen(prev => !prev);
    };

    const handleNavbarContact = () => {
        if (!currentUser) {
            setPage({ name: 'login' });
            return;
        }
        setIsChatPopupOpen(false);
        setPage({ name: 'contact' });
    };

    const handleChatOnWebsite = () => {
        if (!currentUser) {
            setIsChatPopupOpen(false);
            setPage({ name: 'login' });
            return;
        }

        setIsChatPopupOpen(false);
        const hasConversation = messages.some(
            msg => msg.from === currentUser.email || msg.to === currentUser.email
        );
        if (!hasConversation) {
            const welcomeMessages = [
                "Hi there! How can I help you plan your next adventure?",
                "Welcome to Exploration Himalayan! Do you have any questions about our treks?",
                "Hey! Ready to explore the mountains? Let me know how I can assist."
            ];
            const randomMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            handleSendMessage({
                type: 'text',
                from: 'admin',
                to: currentUser.email,
                content: randomMsg,
            });
        }
        setIsChatOpen(true);
    };

    const handleLoginSuccess = (data) => {
        setCurrentUser(data.user);
        localStorage.setItem('token', data.token);
        if (data.user.isAdmin) {
            setIsAdmin(true);
        }
        window.location.href = '/';
    };

    const handleLogin = async (email, password) => {
        try {
            const response = await api.login(email, password);
            if (response.data.success) {
                handleLoginSuccess(response.data);
            }
            return response.data;
        } catch (err) {
            return err.response?.data || { success: false, message: 'An unexpected error occurred.' };
        }
    };
    
    const handleSignup = async (signupData) => {
        try {
            const response = await api.verifyOtpAndSignup(signupData);
            if (response.data.success) {
                handleLoginSuccess(response.data);
            }
            return response.data;
        } catch (err) {
            return err.response.data;
        }
    };

    const handleLoginWithOtp = async (loginData) => {
        try {
            const response = await api.verifyLoginOtp(loginData);
            if (response.data.success) {
                handleLoginSuccess(response.data);
            }
            return response.data;
        } catch (err) {
            return err.response.data;
        }
    };
    
    const handleGoogleSignIn = async (token) => {
        try {
            const response = await api.googleSignIn(token);
            if (response.data.success) {
                handleLoginSuccess(response.data);
            }
            return response.data;
        } catch (err) {
            console.error("Google Sign-In failed on the frontend:", err);
            return err.response.data;
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsAdmin(false);
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const handleUpdateProfile = async (email, profileData) => {
        try {
            const response = await api.updateProfile({ email, ...profileData });
            if (response.data.success) {
                setCurrentUser(response.data.user);
            }
            return response.data;
        } catch (err) {
            return err.response.data;
        }
    };
    
    const handleChangePassword = async (email, oldPassword, newPassword) => {
        try {
            const response = await api.changePassword({ email, oldPassword, newPassword });
            return response.data;
        } catch (err) {
            return err.response.data;
        }
    };

    const handleNewBooking = (newBooking) => {
        setBookings(prev => [newBooking, ...prev]);
        setPaymentStatus({ show: true, status: 'success', message: 'Your booking inquiry has been sent!' });
    };

    const handlePaymentFailure = (message) => {
        setPaymentStatus({ show: true, status: 'failure', message: message || 'Your payment could not be processed.' });
    };

    const handleBookingUpdate = (updatedBooking) => {
        setBookings(prev => prev.map(b => b._id === updatedBooking._id ? updatedBooking : b));
        setPaymentStatus({ show: true, status: 'success', message: 'Your payment was successful and your booking has been updated.' });
    };

    const handleTrekFormSubmit = async (trekData, trekId) => {
        if (trekId) {
            const res = await api.updateTrek(trekId, trekData);
            setTreks(prev => prev.map(t => t._id === trekId ? res.data : t));
        } else {
            const res = await api.addTrek(trekData);
            setTreks(prev => [...prev, res.data]);
        }
    };

    const handleRemoveTrek = async (trekId) => {
        if (window.confirm('Are you sure you want to delete this trek?')) {
            await api.deleteTrek(trekId);
            setTreks(prev => prev.filter(t => t._id !== trekId));
        }
    };

    const handleUpdateBookingStatus = async (bookingId, status) => {
        const res = await api.updateBookingStatus(bookingId, status);
        if (res.data.success) {
            setBookings(prev => prev.map(b => b._id === bookingId ? res.data.booking : b));
        }
    };

    const handleDeleteBooking = async (bookingId) => {
        if (window.confirm('Are you sure you want to permanently delete this booking?')) {
            const res = await api.deleteBooking(bookingId);
            if (res.data.success) {
                setBookings(prev => prev.filter(b => b._id !== bookingId));
            }
        }
    };

    const handleSendMessage = async (message) => {
        const res = await api.sendMessage(message);
        setMessages(prev => [...prev, res.data]);
    };

    const handleNewReview = (newReview) => {
        setReviews(prev => [newReview, ...prev]);
    };

    const handleUpdateReview = (updatedReview) => {
        setReviews(prev => prev.map(r => r._id === updatedReview._id ? updatedReview : r));
    };

    const handleDeleteReview = (reviewId) => {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
    };

    const handleProductFormSubmit = async (productData, productId) => {
        if (productId) {
            const res = await api.updateProduct(productId, productData);
            setProducts(prev => prev.map(p => p._id === productId ? res.data : p));
        } else {
            const res = await api.addProduct(productData);
            setProducts(prev => [res.data, ...prev]);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await api.deleteProduct(productId);
            setProducts(prev => prev.filter(p => p._id !== productId));
        }
    };

    const handleNewOrder = (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
        setPaymentStatus({ show: true, status: 'success', message: 'Your order has been placed successfully!' });
    };

    const handleProductUpdate = (updatedProduct) => {
        setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    };

    const renderPage = () => {
        switch (page.name) {
            case 'details':
                const selectedTrek = treks.find(t => t._id === page.trekId);
                const trekReviews = reviews.filter(r => r.trekId === page.trekId);
                return selectedTrek ? <TrekDetailPage 
                                        trek={selectedTrek} 
                                        reviews={trekReviews}
                                        bookings={bookings}
                                        onNewBooking={handleNewBooking}
                                        onBookingUpdate={handleBookingUpdate}
                                        onPaymentFailure={handlePaymentFailure}
                                        onNewReview={handleNewReview}
                                        onUpdateReview={handleUpdateReview}
                                        onDeleteReview={handleDeleteReview}
                                        currentUser={currentUser} 
                                        setPage={setPage} 
                                    /> : <HomePage treks={treks} setPage={setPage} />;
            case 'admin':
                return isAdmin ? <AdminPanel 
                                    treks={treks} 
                                    bookings={bookings} 
                                    messages={messages} 
                                    users={users} 
                                    payments={payments}
                                    products={products}
                                    orders={orders}
                                    onFormSubmit={handleTrekFormSubmit} 
                                    onRemoveTrek={handleRemoveTrek} 
                                    onUpdateBookingStatus={handleUpdateBookingStatus} 
                                    onDeleteBooking={handleDeleteBooking}
                                    onSendMessage={handleSendMessage}
                                    onProductSubmit={handleProductFormSubmit}
                                    onDeleteProduct={handleDeleteProduct}
                                /> : <HomePage treks={treks} setPage={setPage} />;
            case 'dashboard':
                return <DashboardPage 
                            bookings={bookings} 
                            payments={payments}
                            orders={orders}
                            currentUser={currentUser} 
                            onUpdateProfile={handleUpdateProfile} 
                            onChangePassword={handleChangePassword}
                            onBookingUpdate={handleBookingUpdate}
                            onPaymentFailure={handlePaymentFailure}
                            setPage={setPage}
                        />;
            case 'login':
                return <AuthPage 
                            title="Login" 
                            onLogin={handleLogin} 
                            onLoginWithOtp={handleLoginWithOtp}
                            onGoogleSignIn={handleGoogleSignIn}
                            isLogin={true} 
                            setPage={setPage}
                            initialState={page.state}
                        />;
            case 'signup':
                return <AuthPage 
                            title="Sign Up" 
                            onSignup={handleSignup}
                            onGoogleSignIn={handleGoogleSignIn}
                            isLogin={false} 
                            setPage={setPage} 
                        />;
            case 'contact': 
                if (!currentUser) {
                    return <AuthPage title="Login to Chat" onLogin={handleLogin} onLoginWithOtp={handleLoginWithOtp} onGoogleSignIn={handleGoogleSignIn} isLogin={true} setPage={setPage} />;
                }
                return <ContactPage currentUser={currentUser} messages={messages} onSendMessage={handleSendMessage} />;
            case 'shop':
                return <ShopPage products={products} setPage={setPage} />;
            case 'productDetails':
                const selectedProduct = products.find(p => p._id === page.productId);
                return selectedProduct ? <ProductDetailPage 
                                            product={selectedProduct} 
                                            currentUser={currentUser} 
                                            orders={orders}
                                            onNewOrder={handleNewOrder}
                                            onProductUpdate={handleProductUpdate}
                                            onPaymentFailure={handlePaymentFailure}
                                            setPage={setPage} 
                                        /> : <ShopPage products={products} setPage={setPage} />;
            case 'treks': return <TreksPage treks={treks} setPage={setPage} />;
            case 'upcoming': return <TreksPage treks={treks.filter(t => t.isUpcoming)} setPage={setPage} isUpcomingPage={true} />;
            case 'about': return <AboutUsPage />;
            case 'privacy': return <PrivacyPolicyPage />;
            case 'cancellation': return <CancellationPolicyPage />;
            case 'terms': return <TermsPage />;
            case 'faq': return <FAQPage />;
            case 'home':
            default:
                return <HomePage treks={treks} setPage={setPage} />;
        }
    };
    
    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans flex flex-col min-h-screen transition-colors duration-500">
            <Header setPage={setPage} onContactClick={handleNavbarContact} currentUser={currentUser} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} notifications={notifications} onNotificationUpdate={handleNotificationUpdate}/>
            <main className="flex-grow">
                <div key={page.name + (page.trekId || '')} className="animate-fade-in">
                    {renderPage()}
                </div>
            </main>
            
            <div className={"fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 " + (isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none')} onClick={() => setIsChatOpen(false)}>
                <div 
                    className={"fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-full max-w-sm sm:max-w-md h-[70vh] max-h-[600px] z-50 transition-all duration-300 ease-out origin-bottom-right " + (isChatOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none')}
                    onClick={(e) => e.stopPropagation()}
                >
                     {currentUser && <ChatWindow currentUser={currentUser} messages={messages} onSendMessage={handleSendMessage} />}
                </div>
            </div>
            
            <div className="fixed bottom-6 right-6 z-40">
                <div 
                    className={`absolute bottom-20 right-0 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border dark:border-gray-700 p-4 transition-all duration-300 ease-out origin-bottom-right ${isChatPopupOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
                >
                    <h3 className="font-bold text-center mb-4">How can we help?</h3>
                    <div className="space-y-3">
                        <button 
                            onClick={handleChatOnWebsite}
                            className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300"
                        >
                            Chat on Website
                        </button>
                        <a 
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hello, I have a question.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full block text-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300"
                        >
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>
                <button
                    onClick={handleFloatingButtonClick}
                    className="bg-teal-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300"
                    aria-label="Open Chat Options"
                >
                    {(isChatPopupOpen || isChatOpen) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    )}
                </button>
            </div>
            
            {showBackToTop && (
                <button onClick={scrollToTop} className="fixed bottom-28 right-6 bg-gray-500/50 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 hover:bg-gray-500 transition-all duration-300 z-40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                </button>
            )}

            <PaymentStatusModal 
                isOpen={paymentStatus.show}
                onClose={() => setPaymentStatus({ show: false, status: '', message: '' })}
                status={paymentStatus.status}
                message={paymentStatus.message}
            />

            <Footer setPage={setPage} />
        </div>
    );
}
