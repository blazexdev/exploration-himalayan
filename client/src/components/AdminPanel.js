import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import SearchInput from './SearchInput';
import Pagination from './Pagination';

const icons = {
  trash: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>,
  plus: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  edit: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  send: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
};
const LOGO_URL = "https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png](https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png";
const ITEMS_PER_PAGE = 5;

const AdminPanel = ({ 
    treks = [], 
    bookings = [], 
    messages = [], 
    users = [], 
    payments = [], 
    products = [],
    orders = [],
    onFormSubmit, 
    onRemoveTrek, 
    onUpdateBookingStatus, 
    onDeleteBooking, 
    onSendMessage,
    onProductSubmit,
    onDeleteProduct
}) => {
    const [trekData, setTrekData] = useState({ name: '', location: '', duration: '', difficulty: 'Moderate', price: '', description: '', imageUrl: '', itinerary: [], locationPhotos: [], isUpcoming: false, isFeatured: false });
    const [editingTrekId, setEditingTrekId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replyMedia, setReplyMedia] = useState([]);
    const chatEndRef = useRef(null);
    const [adminEmail, setAdminEmail] = useState('');
    const [adminMessage, setAdminMessage] = useState('');
    const [currentAdmins, setCurrentAdmins] = useState([]);
    const [newPhotoUrl, setNewPhotoUrl] = useState('');
    const [productData, setProductData] = useState({ name: '', description: '', price: '', imageUrl: '', images: [] });
    const [editingProductId, setEditingProductId] = useState(null);
    const [showProductForm, setShowProductForm] = useState(false);

    const [trekPage, setTrekPage] = useState(1);
    const [trekSearch, setTrekSearch] = useState('');
    const [bookingPage, setBookingPage] = useState(1);
    const [bookingSearch, setBookingSearch] = useState('');
    const [paymentPage, setPaymentPage] = useState(1);
    const [paymentSearch, setPaymentSearch] = useState('');
    const [chatPage, setChatPage] = useState(1);
    const [chatSearch, setChatSearch] = useState('');
    const [orderPage, setOrderPage] = useState(1);
    const [orderSearch, setOrderSearch] = useState('');

    useEffect(() => {
        setCurrentAdmins(users.filter(u => u.isAdmin));
    }, [users]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedUser]);
    
    const filteredTreks = useMemo(() =>
        treks.filter(t =>
            t.name.toLowerCase().includes(trekSearch.toLowerCase()) ||
            t.location.toLowerCase().includes(trekSearch.toLowerCase())
        ), [treks, trekSearch]);

    const paginatedTreks = useMemo(() =>
        filteredTreks.slice((trekPage - 1) * ITEMS_PER_PAGE, trekPage * ITEMS_PER_PAGE),
        [filteredTreks, trekPage]
    );
    const totalTrekPages = Math.ceil(filteredTreks.length / ITEMS_PER_PAGE);

    const filteredBookings = useMemo(() => 
        bookings.filter(b => 
            b.trekName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
            b.name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
            b.userEmail.toLowerCase().includes(bookingSearch.toLowerCase())
        ), [bookings, bookingSearch]);
    
    const paginatedBookings = useMemo(() => 
        filteredBookings.slice((bookingPage - 1) * ITEMS_PER_PAGE, bookingPage * ITEMS_PER_PAGE),
        [filteredBookings, bookingPage]
    );
    const totalBookingPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

    const filteredPayments = useMemo(() =>
        payments.filter(p =>
            p.razorpay_payment_id.toLowerCase().includes(paymentSearch.toLowerCase()) ||
            (p.trekName && p.trekName.toLowerCase().includes(paymentSearch.toLowerCase())) ||
            p.userName.toLowerCase().includes(paymentSearch.toLowerCase())
        ), [payments, paymentSearch]);

    const paginatedPayments = useMemo(() =>
        filteredPayments.slice((paymentPage - 1) * ITEMS_PER_PAGE, paymentPage * ITEMS_PER_PAGE),
        [filteredPayments, paymentPage]
    );
    const totalPaymentPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);

    const filteredOrders = useMemo(() =>
        orders.filter(o =>
            o && o.orderId && o.userName && (
                o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
                o.userName.toLowerCase().includes(orderSearch.toLowerCase())
            )
        ), [orders, orderSearch]);

    const paginatedOrders = useMemo(() =>
        filteredOrders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE),
        [filteredOrders, orderPage]
    );
    const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

    const userConversations = useMemo(() => messages.reduce((acc, msg) => {
        const userEmail = msg.from === 'admin' ? msg.to : msg.from;
        if (!acc[userEmail]) { acc[userEmail] = []; }
        acc[userEmail].push(msg);
        return acc;
    }, {}), [messages]);

    const filteredChatUsers = useMemo(() =>
        Object.keys(userConversations).filter(email =>
            email.toLowerCase().includes(chatSearch.toLowerCase())
        ), [userConversations, chatSearch]);

    const paginatedChatUsers = useMemo(() =>
        filteredChatUsers.slice((chatPage - 1) * ITEMS_PER_PAGE, chatPage * ITEMS_PER_PAGE),
        [filteredChatUsers, chatPage]
    );
    const totalChatPages = Math.ceil(filteredChatUsers.length / ITEMS_PER_PAGE);
    
    const selectedUserData = useMemo(() => 
        users.find(u => u.email === selectedUser), 
        [users, selectedUser]
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTrekData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setTrekData(prev => ({ ...prev, [name]: checked }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setTrekData(prev => ({ ...prev, imageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleItineraryChange = (index, field, value) => {
        const newItinerary = [...trekData.itinerary];
        newItinerary[index][field] = value;
        setTrekData(prev => ({ ...prev, itinerary: newItinerary }));
    };
    const addItineraryDay = () => setTrekData(prev => ({ ...prev, itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: '', description: '' }] }));
    const removeItineraryDay = (index) => setTrekData(prev => ({ ...prev, itinerary: trekData.itinerary.filter((_, i) => i !== index) }));
    const handleAddPhoto = () => {
        if (newPhotoUrl.trim() !== '') {
            setTrekData(prev => ({ ...prev, locationPhotos: [...prev.locationPhotos, newPhotoUrl.trim()] }));
            setNewPhotoUrl('');
        }
    };
    const handleRemovePhoto = (index) => {
        setTrekData(prev => ({ ...prev, locationPhotos: prev.locationPhotos.filter((_, i) => i !== index) }));
    };
    const handleEditClick = (trek) => {
        setEditingTrekId(trek._id);
        setTrekData({ ...trek, price: trek.price.toString(), itinerary: trek.itinerary || [], locationPhotos: trek.locationPhotos || [], isUpcoming: trek.isUpcoming || false, isFeatured: trek.isFeatured || false });
        setShowForm(true);
    };
    const resetForm = () => {
        setEditingTrekId(null);
        setTrekData({ name: '', location: '', duration: '', difficulty: 'Moderate', price: '', description: '', imageUrl: '', itinerary: [], locationPhotos: [], isUpcoming: false, isFeatured: false });
        setShowForm(false);
    };
    const handleFormSubmit = (e) => {
        e.preventDefault();
        onFormSubmit({ ...trekData, price: Number(trekData.price) }, editingTrekId);
        resetForm();
    };
    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (replyMessage.trim() === '' && replyMedia.length === 0) return;

        if (replyMedia.length > 0) {
            replyMedia.forEach(mediaFile => {
                onSendMessage({
                    type: mediaFile.startsWith('data:image') ? 'image' : 'video',
                    from: 'admin',
                    to: selectedUser,
                    content: mediaFile
                });
            });
            setReplyMedia([]);
        }

        if (replyMessage.trim() !== '') {
            onSendMessage({ type: 'text', from: 'admin', to: selectedUser, content: replyMessage.trim() });
            setReplyMessage('');
        }
    };
    const handleManageAdmin = async (makeAdmin) => {
        setAdminMessage('');
        if (!adminEmail) {
            setAdminMessage('Please enter an email address.');
            return;
        }
        try {
            const res = await api.manageAdminStatus(adminEmail, makeAdmin);
            if (res.data.success) {
                setAdminMessage(res.data.message);
                setAdminEmail('');
            }
        } catch (error) {
            setAdminMessage(error.response?.data?.message || 'An error occurred.');
        }
    };

    const handleMediaUpload = (e, setter) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setter(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
    };

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductImageUpload = (e, isMain) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            if (isMain) {
                setProductData(prev => ({ ...prev, imageUrl: reader.result }));
            } else {
                setProductData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveProductImage = (index) => {
        setProductData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleProductFormSubmit = (e) => {
        e.preventDefault();
        onProductSubmit({ ...productData, price: Number(productData.price) }, editingProductId);
        resetProductForm();
    };

    const resetProductForm = () => {
        setEditingProductId(null);
        setProductData({ name: '', description: '', price: '', imageUrl: '', images: [] });
        setShowProductForm(false);
    };

    const handleProductEditClick = (product) => {
        setEditingProductId(product._id);
        setProductData({ ...product, price: product.price.toString(), images: product.images || [] });
        setShowProductForm(true);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">Admin Panel</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Manage Treks</h2>
                    <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300 flex items-center">
                        <span className="mr-2">{icons.plus}</span> {showForm && !editingTrekId ? 'Cancel' : 'Add New Trek'}
                    </button>
                </div>
                {showForm && (
                     <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                        <h3 className="md:col-span-2 text-2xl font-bold text-gray-900 dark:text-white">{editingTrekId ? 'Edit Trek' : 'Add New Trek'}</h3>
                        <input type="text" name="name" placeholder="Trek Name" value={trekData.name} onChange={handleInputChange} className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <input type="text" name="location" placeholder="Location" value={trekData.location} onChange={handleInputChange} className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <input type="text" name="duration" placeholder="Duration (e.g., 10 Days)" value={trekData.duration} onChange={handleInputChange} className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <select name="difficulty" value={trekData.difficulty} onChange={handleInputChange} className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700"><option>Moderate</option><option>Challenging</option><option>Strenuous</option><option>Extreme</option></select>
                        <input type="number" name="price" placeholder="Price (₹)" value={trekData.price} onChange={handleInputChange} className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Main Image</label>
                            <input type="file" onChange={handleImageUpload} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                            {trekData.imageUrl && <img src={trekData.imageUrl} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg" />}
                        </div>
                        
                        <textarea name="description" placeholder="Description" value={trekData.description} onChange={handleInputChange} className="md:col-span-2 p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" rows="4" required></textarea>
                        
                        <div className="md:col-span-2 flex items-center space-x-8">
                            <div className="flex items-center">
                                <input type="checkbox" id="isFeatured" name="isFeatured" checked={trekData.isFeatured} onChange={handleCheckboxChange} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Mark as Featured</label>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="isUpcoming" name="isUpcoming" checked={trekData.isUpcoming} onChange={handleCheckboxChange} className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                                <label htmlFor="isUpcoming" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Mark as Upcoming</label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <h4 className="text-xl font-bold mb-4 border-t pt-4">Daily Itinerary</h4>
                            {trekData.itinerary.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-8 gap-2 mb-4 items-start">
                                    <input type="number" placeholder="Day" value={item.day} onChange={(e) => handleItineraryChange(index, 'day', e.target.value)} className="p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 md:col-span-1" />
                                    <input type="text" placeholder="Title" value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} className="p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 md:col-span-3" />
                                    <textarea placeholder="Description" value={item.description} onChange={(e) => handleItineraryChange(index, 'description', e.target.value)} className="p-2 border rounded-lg bg-gray-100 dark:bg-gray-700 md:col-span-3" rows="2" />
                                    <button type="button" onClick={() => removeItineraryDay(index)} className="bg-red-500 text-white font-bold p-2 rounded-lg hover:bg-red-600 md:col-span-1 self-center">Remove</button>
                                </div>
                            ))}
                            <button type="button" onClick={addItineraryDay} className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">Add Day</button>
                        </div>

                        <div className="md:col-span-2">
                            <h4 className="text-xl font-bold mb-4 border-t pt-4">Location Photos</h4>
                            <div className="flex items-center gap-2 mb-4">
                                <input type="url" placeholder="Add Photo URL" value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} className="flex-grow p-2 border rounded-lg bg-gray-100 dark:bg-gray-700" />
                                <button type="button" onClick={handleAddPhoto} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Add Photo</button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {trekData.locationPhotos.map((photo, index) => (
                                    <div key={index} className="relative group">
                                        <img src={photo} alt={`Location ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                                        <button type="button" onClick={() => handleRemovePhoto(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 text-right space-x-4 mt-4">
                             <button type="button" onClick={resetForm} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500">Cancel</button>
                             <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600">{editingTrekId ? 'Update Trek' : 'Save Trek'}</button>
                        </div>
                    </form>
                )}
                <SearchInput searchTerm={trekSearch} onSearchChange={setTrekSearch} placeholder="Search by trek name or location..." />
                <div className="overflow-x-auto"><table className="w-full text-left table-fixed"><thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-4 font-semibold w-2/5">Trek Name</th><th className="p-4 font-semibold w-2/5">Location</th><th className="p-4 font-semibold w-1/5">Status</th><th className="p-4 font-semibold w-1/5">Actions</th></tr></thead><tbody>
                    {paginatedTreks.map(trek => (<tr key={trek._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="p-4 truncate">{trek.name}</td><td className="p-4 truncate">{trek.location}</td><td className="p-4"><div className="flex flex-col space-y-1 items-start">{trek.isFeatured && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full text-center">Featured</span>}{trek.isUpcoming && <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full text-center">Upcoming</span>}</div></td><td className="p-4"><div className="flex space-x-2"><button onClick={() => handleEditClick(trek)} className="text-blue-500 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50">{icons.edit}</button><button onClick={() => onRemoveTrek(trek._id)} className="text-red-500 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">{icons.trash}</button></div></td></tr>))}
                </tbody></table></div>
                <Pagination currentPage={trekPage} totalPages={totalTrekPages} onPageChange={setTrekPage} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Bookings</h2>
                <SearchInput searchTerm={bookingSearch} onSearchChange={setBookingSearch} placeholder="Search by trek, name, or email..." />
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-4 font-semibold">Trek</th><th className="p-4 font-semibold">User</th><th className="p-4 font-semibold">Date</th><th className="p-4 font-semibold">Status</th><th className="p-4 font-semibold">Actions</th></tr></thead>
                        <tbody>
                            {paginatedBookings.map(booking => (
                                <tr key={booking._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4">{booking.trekName}</td>
                                    <td className="p-4">{booking.name} ({booking.userEmail})</td>
                                    <td className="p-4">{booking.date}</td>
                                    <td className="p-4">{booking.status}</td>
                                    <td className="p-4 flex space-x-2">
                                        <button onClick={() => onUpdateBookingStatus(booking._id, 'Accepted')} className="bg-green-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-green-700 disabled:opacity-50" disabled={booking.status === 'Accepted'}>Accept</button>
                                        <button onClick={() => onUpdateBookingStatus(booking._id, 'Rejected')} className="bg-orange-600 text-white font-bold py-1 px-3 rounded-lg hover:bg-orange-700 disabled:opacity-50" disabled={booking.status === 'Rejected'}>Reject</button>
                                        <button onClick={() => onDeleteBooking(booking._id)} className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700">
                                            <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={bookingPage} totalPages={totalBookingPages} onPageChange={setBookingPage} />
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Shop</h2>
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => { setShowProductForm(prev => !prev); if (showProductForm) resetProductForm(); }} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300 flex items-center">
                        <span className="mr-2">{icons.plus}</span> {showProductForm && !editingProductId ? 'Cancel' : 'Add New Product'}
                    </button>
                </div>
                {showProductForm && (
                     <form onSubmit={handleProductFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
                        <h3 className="md:col-span-2 text-2xl font-bold">{editingProductId ? 'Edit Product' : 'Add New Product'}</h3>
                        <input type="text" name="name" placeholder="Product Name" value={productData.name} onChange={handleProductInputChange} className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <input type="number" name="price" placeholder="Price (₹)" value={productData.price} onChange={handleProductInputChange} className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <textarea name="description" placeholder="Description" value={productData.description} onChange={handleProductInputChange} className="md:col-span-2 p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" rows="4" required></textarea>
                        <div>
                            <label className="block text-sm font-medium mb-2">Main Image</label>
                            <input type="file" onChange={(e) => handleProductImageUpload(e, true)} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                            {productData.imageUrl && <img src={productData.imageUrl} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg" />}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Additional Images</label>
                            <input type="file" onChange={(e) => handleProductImageUpload(e, false)} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {productData.images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img src={img} alt={`Sub-image ${index+1}`} className="w-full h-24 object-cover rounded-lg" />
                                        <button type="button" onClick={() => handleRemoveProductImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 text-xs rounded-full">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 text-right space-x-4 mt-4">
                             <button type="button" onClick={resetProductForm} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500">Cancel</button>
                             <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600">{editingProductId ? 'Update Product' : 'Save Product'}</button>
                        </div>
                    </form>
                )}
                <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-4 font-semibold">Product Name</th><th className="p-4 font-semibold">Price</th><th className="p-4 font-semibold">Actions</th></tr></thead><tbody>
                    {products.map(product => (<tr key={product._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="p-4">{product.name}</td><td className="p-4">₹{product.price.toLocaleString('en-IN')}</td><td className="p-4 flex space-x-2"><button onClick={() => handleProductEditClick(product)} className="text-blue-500 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50">{icons.edit}</button><button onClick={() => onDeleteProduct(product._id)} className="text-red-500 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">{icons.trash}</button></td></tr>))}
                </tbody></table></div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Shop Orders</h2>
                <SearchInput searchTerm={orderSearch} onSearchChange={setOrderSearch} placeholder="Search by order ID or name..." />
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-4 font-semibold">Order ID</th><th className="p-4 font-semibold">User</th><th className="p-4 font-semibold">Products</th><th className="p-4 font-semibold">Amount</th><th className="p-4 font-semibold">Address</th><th className="p-4 font-semibold">Date</th></tr></thead>
                        <tbody>
                            {paginatedOrders.map(order => (
                                <tr key={order._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 text-sm truncate" title={order.orderId}>{order.orderId}</td>
                                    <td className="p-4">{order.userName} ({order.userEmail})</td>
                                    <td className="p-4">{order.products.map(p => p.name).join(', ')}</td>
                                    <td className="p-4">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                                    <td className="p-4 text-sm">{order.shippingAddress ? `${order.shippingAddress.address}, ${order.shippingAddress.phone}` : 'N/A'}</td>
                                    <td className="p-4">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={orderPage} totalPages={totalOrderPages} onPageChange={setOrderPage} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Payment Records</h2>
                <SearchInput searchTerm={paymentSearch} onSearchChange={setPaymentSearch} placeholder="Search by payment ID, trek, or name..." />
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="p-4 font-semibold">Payment ID</th>
                                <th className="p-4 font-semibold">Item</th>
                                <th className="p-4 font-semibold">User</th>
                                <th className="p-4 font-semibold">Amount</th>
                                <th className="p-4 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPayments.map(payment => (
                                <tr key={payment._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 text-sm truncate" title={payment.razorpay_payment_id}>{payment.razorpay_payment_id}</td>
                                    <td className="p-4">{payment.trekName || 'Shop Order'}</td>
                                    <td className="p-4">{payment.userName} ({payment.userEmail})</td>
                                    <td className="p-4">₹{(payment.amount / 100).toLocaleString('en-IN')}</td>
                                    <td className="p-4">{new Date(payment.createdAt).toLocaleDateString('en-IN')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={paymentPage} totalPages={totalPaymentPages} onPageChange={setPaymentPage} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Chats</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-bold mb-4">Users</h3>
                        <SearchInput searchTerm={chatSearch} onSearchChange={setChatSearch} placeholder="Search by email..." />
                        <div className="space-y-2">
                            {paginatedChatUsers.map(email => (
                                <button key={email} onClick={() => setSelectedUser(email)} className={`w-full text-left p-3 rounded-lg transition ${selectedUser === email ? 'bg-teal-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                    {email}
                                </button>
                            ))}
                        </div>
                        <Pagination currentPage={chatPage} totalPages={totalChatPages} onPageChange={setChatPage} />
                    </div>
                    <div className="md:col-span-2 bg-gray-50 dark:bg-gray-900 rounded-lg flex flex-col h-[60vh]">
                        {selectedUser ? (
                            <>
                                <div className="flex-grow p-6 space-y-4 overflow-y-auto">
                                    {userConversations[selectedUser].map(msg => (
                                        <div key={msg._id} className={`flex items-end gap-3 ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.from !== 'admin' && (
                                                <img src={selectedUserData?.imageUrl || `https://placehold.co/40x40/e2e8f0/4a5568?text=${selectedUserData?.name.charAt(0)}`} alt={selectedUserData?.name} className="w-8 h-8 rounded-full object-cover"/>
                                            )}
                                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.from === 'admin' ? 'bg-teal-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                                {msg.type === 'text' && <p>{msg.content}</p>}
                                                {msg.type === 'image' && <img src={msg.content} alt={msg.fileName} className="rounded-lg"/>}
                                                {msg.type === 'video' && <video src={msg.content} controls className="rounded-lg w-full"/>}
                                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                            {msg.from === 'admin' && (
                                                <img src={LOGO_URL} alt="Admin" className="w-8 h-8 rounded-full object-cover"/>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                                <form onSubmit={handleReplySubmit} className="p-4 border-t dark:border-gray-700 flex items-center">
                                    <input type="file" id="admin-chat-upload" className="hidden" onChange={(e) => handleMediaUpload(e, setReplyMedia)} accept="image/*,video/*" />
                                    <label htmlFor="admin-chat-upload" className="mr-4 text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 p-2 cursor-pointer">
                                        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    </label>
                                    <input type="text" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder={`Reply to ${selectedUser}...`} className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg p-3 focus:outline-none"/>
                                    <button type="submit" className="ml-4 bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600"><span className="w-6 h-6">{icons.send}</span></button>
                                </form>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">Select a conversation to view messages.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Admins</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Current Admins</h3>
                        <ul className="list-disc list-inside space-y-2">
                            {currentAdmins.map(admin => (
                                <li key={admin._id} className="text-gray-600 dark:text-gray-400">{admin.name} ({admin.email})</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Grant or Revoke Privileges</h3>
                        <div className="space-y-4 max-w-lg">
                            {adminMessage && <p className="text-center p-3 rounded-lg bg-teal-500/20 text-teal-300">{adminMessage}</p>}
                            <input type="email" placeholder="User's Email Address" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                            <div className="flex space-x-4">
                                <button onClick={() => handleManageAdmin(true)} className="w-full bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700">Make Admin</button>
                                <button onClick={() => handleManageAdmin(false)} className="w-full bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700">Remove Admin</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
