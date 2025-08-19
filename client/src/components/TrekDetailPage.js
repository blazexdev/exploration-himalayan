// client/src/components/TrekDetailPage.js

import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import api from '../services/api';

const icons = {
    location: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    clock: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    mountain: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>,
    rupee: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="M6 13h12"/><path d="M18 13c0 4-4 4-4 4H6"/><path d="M12 21V3"/></svg>,
    chevronLeft: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    chevronRight: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    moreVertical: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>,
};

const useIntersectionObserver = (options) => {
    const [ref, setRef] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, options);

        if (ref) { observer.observe(ref); }
        return () => { if (ref) { observer.unobserve(ref); } };
    }, [ref, options]);

    return [setRef, isVisible];
};

const StarRating = ({ rating, onRatingChange }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => onRatingChange && onRatingChange(star)}
                    className={`w-6 h-6 ${onRatingChange ? 'cursor-pointer' : ''} ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

const TrekDetailPage = ({ trek, reviews = [], bookings = [], onNewBooking, onBookingUpdate, onPaymentFailure, onNewReview, onUpdateReview, onDeleteReview, currentUser, setPage }) => {
    const [formData, setFormData] = useState({ name: '', email: '', date: '', phone: '', address: '', gender: '', age: '' });
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewMedia, setReviewMedia] = useState([]);
    const [reviewError, setReviewError] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [editMedia, setEditMedia] = useState([]);
    const [activeReviewMenu, setActiveReviewMenu] = useState(null);

    const [detailsRef, isDetailsVisible] = useIntersectionObserver({ threshold: 0.1 });
    const [bookingRef, isBookingVisible] = useIntersectionObserver({ threshold: 0.1 });

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({ ...prev, name: currentUser.name || '', email: currentUser.email || '', phone: currentUser.phone || '', address: currentUser.address || '', gender: currentUser.gender || '', age: currentUser.age || '' }));
        }
    }, [currentUser]);

    const canUserReview = () => {
        if (!currentUser) return false;
        const hasAcceptedBooking = bookings.some(b => b.userEmail === currentUser.email && b.trekId === trek._id && b.status === 'Accepted');
        const hasAlreadyReviewed = reviews.some(r => r.userId === currentUser._id);
        return hasAcceptedBooking && !hasAlreadyReviewed;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNextPhoto = (e) => {
        e.stopPropagation();
        const photoList = selectedImageIndex.source === 'gallery' ? trek.locationPhotos : reviews[selectedImageIndex.reviewIndex].mediaUrls;
        setSelectedImageIndex(prev => ({ ...prev, index: (prev.index + 1) % photoList.length }));
    };

    const handlePrevPhoto = (e) => {
        e.stopPropagation();
        const photoList = selectedImageIndex.source === 'gallery' ? trek.locationPhotos : reviews[selectedImageIndex.reviewIndex].mediaUrls;
        setSelectedImageIndex(prev => ({ ...prev, index: (prev.index - 1 + photoList.length) % photoList.length }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setPaymentError('');
        setIsLoading(true);

        if (!currentUser) {
            alert("Please login to book a trek.");
            setPage({ name: 'login' });
            setIsLoading(false);
            return;
        }

        if (paymentAmount && Number(paymentAmount) > 0) {
            await displayRazorpay();
        } else {
            try {
                const bookingData = {
                    ...formData,
                    trekId: trek._id,
                    trekName: trek.name,
                    userEmail: currentUser.email,
                    totalPrice: trek.price,
                    paymentStatus: 'Pending'
                };
                const res = await api.addBooking(bookingData);
                onNewBooking(res.data);
                setIsBookingModalOpen(true);
            } catch (err) {
                setPaymentError('Failed to create booking. Please try again.');
            }
        }
        setIsLoading(false);
    };

    const displayRazorpay = async () => {
        try {
            const { data: { order } } = await api.createRazorpayOrder(paymentAmount);

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "Exploration Himalayan",
                description: `Booking for ${trek.name}`,
                image: "https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png",
                order_id: order.id,
                handler: async function (response) {
                    const paymentData = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: order.amount,
                        bookingDetails: { 
                            ...formData, 
                            trekId: trek._id, 
                            trekName: trek.name, 
                            userEmail: currentUser.email, 
                            totalPrice: trek.price 
                        }
                    };
                    
                    const { data } = await api.verifyNewBookingPayment(paymentData);
                    if (data.success) {
                        onNewBooking(data.booking, data.payment);
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
            onPaymentFailure('Could not initiate payment.');
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

    const handleRemoveMedia = (index, mediaList, setter) => {
        setter(mediaList.filter((_, i) => i !== index));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setReviewError('');
        if (reviewRating === 0 || !reviewComment.trim()) {
            setReviewError('Please provide a rating and a comment.');
            return;
        }
        try {
            const res = await api.addReview({
                trekId: trek._id,
                rating: reviewRating,
                comment: reviewComment,
                mediaUrls: reviewMedia,
            });
            if (res.data.success) {
                onNewReview(res.data.review);
                setReviewRating(0);
                setReviewComment('');
                setReviewMedia([]);
            }
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to submit review.');
        }
    };

    const handleEditClick = (review) => {
        setEditingReviewId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setEditMedia(review.mediaUrls || []);
        setActiveReviewMenu(null);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setReviewError('');
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
        setReviewError('');
        try {
            const res = await api.updateReview(editingReviewId, {
                rating: editRating,
                comment: editComment,
                mediaUrls: editMedia,
            });
            if (res.data.success) {
                onUpdateReview(res.data.review);
                setEditingReviewId(null);
            }
        } catch (err) {
            setReviewError(err.response?.data?.message || 'Failed to update review.');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await api.deleteReview(reviewId);
                onDeleteReview(reviewId);
            } catch (err) {
                setReviewError(err.response?.data?.message || 'Failed to delete review.');
            }
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <section className="relative h-[50vh] bg-cover bg-center text-white" style={{ backgroundImage: `url(${trek.imageUrl})` }}>
                 <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="container mx-auto px-6 h-full flex flex-col justify-end relative z-10 pb-12">
                    <h1 className="text-5xl font-extrabold">{trek.name}</h1>
                    <p className="text-xl flex items-center mt-2"><span className="inline-block w-6 h-6 mr-2">{icons.location}</span> {trek.location}</p>
                </div>
            </section>
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div ref={detailsRef} className={`lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border dark:border-gray-700 transition-all duration-700 ${isDetailsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h2 className="text-3xl font-bold mb-6">Trek Overview</h2>
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="flex items-center space-x-3"><span className="text-teal-500 dark:text-teal-400 w-6 h-6">{icons.clock}</span><div><p className="font-bold">Duration</p><p className="text-gray-600 dark:text-gray-400">{trek.duration}</p></div></div>
                            <div className="flex items-center space-x-3"><span className="text-teal-500 dark:text-teal-400 w-6 h-6">{icons.mountain}</span><div><p className="font-bold">Difficulty</p><p className="text-gray-600 dark:text-gray-400">{trek.difficulty}</p></div></div>
                            <div className="flex items-center space-x-3"><span className="text-teal-500 dark:text-teal-400 w-6 h-6">{icons.location}</span><div><p className="font-bold">Location</p><p className="text-gray-600 dark:text-gray-400">{trek.location}</p></div></div>
                            <div className="flex items-center space-x-3"><span className="text-teal-500 dark:text-teal-400 w-6 h-6">{icons.rupee}</span><div><p className="font-bold">Price</p><p className="text-gray-600 dark:text-gray-400">₹{trek.price.toLocaleString('en-IN')}</p></div></div>
                        </div>

                        {trek.locationPhotos && trek.locationPhotos.length > 0 && (
                            <>
                                <h3 className="text-2xl font-bold mb-6 border-t dark:border-gray-700 pt-6">Location Photos</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {trek.locationPhotos.map((photo, index) => (
                                        <img key={index} src={photo} alt={`Trek location ${index + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setSelectedImageIndex({ source: 'gallery', index })} />
                                    ))}
                                </div>
                            </>
                        )}

                        <h3 className="text-2xl font-bold mb-6 border-t dark:border-gray-700 pt-6">Trek Details</h3>
                        <p className="leading-relaxed mb-8 whitespace-pre-wrap">{trek.description}</p>
                        
                        <h3 className="text-2xl font-bold mb-6 border-t dark:border-gray-700 pt-6">Daily Itinerary</h3>
                        <div className="space-y-6">
                            {trek.itinerary && trek.itinerary.map(item => (
                                <div key={item.day} className="flex items-start">
                                    <div className="flex-shrink-0 bg-teal-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-lg mr-4">{item.day}</div>
                                    <div>
                                        <h4 className="font-bold text-lg">{item.title}</h4>
                                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-2xl font-bold mb-6 border-t dark:border-gray-700 pt-6">User Reviews</h3>
                        {canUserReview() && (
                            <form onSubmit={handleReviewSubmit} className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg mb-8 border dark:border-gray-700">
                                <h4 className="text-xl font-bold mb-4">Leave a Review</h4>
                                {reviewError && <p className="text-red-500 mb-4">{reviewError}</p>}
                                <div className="mb-4"><label className="block font-bold mb-2">Your Rating</label><StarRating rating={reviewRating} onRatingChange={setReviewRating} /></div>
                                <div className="mb-4"><label className="block font-bold mb-2">Your Comment</label><textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700" rows="4" required></textarea></div>
                                <div className="mb-4">
                                    <label className="block font-bold mb-2">Upload Photos/Videos</label>
                                    <input type="file" onChange={(e) => handleMediaUpload(e, setReviewMedia)} accept="image/*,video/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {reviewMedia.map((media, index) => (
                                            <div key={index} className="relative w-24 h-24">
                                                {media.startsWith('data:image') ? <img src={media} className="w-full h-full object-cover rounded" /> : <video src={media} className="w-full h-full object-cover rounded" />}
                                                <button type="button" onClick={() => handleRemoveMedia(index, reviewMedia, setReviewMedia)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 text-xs rounded-full">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600">Submit Review</button>
                            </form>
                        )}

                        <div className="space-y-8">
                            {reviews.length > 0 ? reviews.map((review, reviewIndex) => (
                                <div key={review._id}>
                                    {editingReviewId === review._id ? (
                                        <form onSubmit={handleUpdateReview} className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg border dark:border-gray-700">
                                            <h4 className="text-xl font-bold mb-4">Edit Your Review</h4>
                                            {reviewError && <p className="text-red-500 mb-4">{reviewError}</p>}
                                            <div className="mb-4"><label className="block font-bold mb-2">Your Rating</label><StarRating rating={editRating} onRatingChange={setEditRating} /></div>
                                            <div className="mb-4"><label className="block font-bold mb-2">Your Comment</label><textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700" rows="4" required></textarea></div>
                                            <div className="mb-4">
                                                <label className="block font-bold mb-2">Upload Photos/Videos</label>
                                                <input type="file" onChange={(e) => handleMediaUpload(e, setEditMedia)} accept="image/*,video/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {editMedia.map((media, index) => (
                                                        <div key={index} className="relative w-24 h-24">
                                                            {media.startsWith('data:image') ? <img src={media} className="w-full h-full object-cover rounded" /> : <video src={media} className="w-full h-full object-cover rounded" />}
                                                            <button type="button" onClick={() => handleRemoveMedia(index, editMedia, setEditMedia)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 text-xs rounded-full">&times;</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex justify-end space-x-4 mt-4">
                                                <button type="button" onClick={handleCancelEdit} className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
                                                <button type="submit" className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex items-start space-x-4">
                                            <img src={review.userImage || `https://placehold.co/48x48/e2e8f0/4a5568?text=${review.userName.charAt(0)}`} alt={review.userName} className="w-12 h-12 rounded-full object-cover" />
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-bold">{review.userName}</p>
                                                        <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <StarRating rating={review.rating} />
                                                        {(currentUser && (currentUser._id === review.userId || currentUser.isAdmin)) && (
                                                            <div className="relative">
                                                                <button onClick={() => setActiveReviewMenu(activeReviewMenu === review._id ? null : review._id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                                                    {icons.moreVertical}
                                                                </button>
                                                                {activeReviewMenu === review._id && (
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border dark:border-gray-700">
                                                                        <button onClick={() => handleEditClick(review)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                                                                            <span className="w-4 h-4">{icons.edit}</span><span>Edit</span>
                                                                        </button>
                                                                        <button onClick={() => handleDeleteReview(review._id)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
                                                                            <span className="w-4 h-4">{icons.trash}</span><span>Delete</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="mt-2 whitespace-pre-wrap">{review.comment}</p>
                                                {review.mediaUrls.length > 0 && (
                                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                                        {review.mediaUrls.map((url, i) => (
                                                            <div key={i} className="cursor-pointer" onClick={() => setSelectedImageIndex({ source: 'review', reviewIndex, index: i })}>
                                                                {url.startsWith('data:image') ? <img src={url} alt={`Review media ${i+1}`} className="w-full h-24 object-cover rounded-md" /> : <video src={url} className="w-full h-24 object-cover rounded-md" />}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )) : <p className="text-gray-500">No reviews yet.</p>}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <div ref={bookingRef} className={`bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md sticky top-28 border dark:border-gray-700 transition-all duration-700 delay-200 ${isBookingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <h3 className="text-2xl font-bold text-center mb-6">Book Your Adventure</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                               <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                               <input type="email" name="email" placeholder="Your Email" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                               <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                               <textarea name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" rows="3" required></textarea>
                               <div className="grid grid-cols-2 gap-4">
                                  <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required>
                                      <option value="">Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                  </select>
                               </div>
                               <input type="date" name="date" value={formData.date} min={today} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                               
                               <div className="border-t dark:border-gray-700 pt-4">
                                   <label htmlFor="paymentAmount" className="block font-bold mb-2">Advance Payment (Optional)</label>
                                   <input type="number" name="paymentAmount" id="paymentAmount" placeholder={`Full amount: ₹${trek.price}`} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" />
                               </div>

                               {paymentError && <p className="text-red-500 text-sm text-center">{paymentError}</p>}
                               
                               <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 transition duration-300 text-lg disabled:opacity-50">
                                   {isLoading ? 'Submitting...' : (paymentAmount && Number(paymentAmount) > 0 ? 'Pay & Book' : 'Send Inquiry')}
                               </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-teal-500 mb-4">Inquiry Sent!</h2>
                    <p>Thank you! We've received your booking inquiry for the {trek.name} and will contact you at {formData.email} shortly.</p>
                </div>
            </Modal>
            
            <Modal isOpen={selectedImageIndex !== null} onClose={() => setSelectedImageIndex(null)} size="4xl">
                {selectedImageIndex !== null && (
                    <div className="relative">
                        <img 
                            src={selectedImageIndex.source === 'gallery' ? trek.locationPhotos[selectedImageIndex.index] : reviews[selectedImageIndex.reviewIndex].mediaUrls[selectedImageIndex.index]} 
                            alt="Trek media enlarged" 
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg" 
                        />
                        <div className="absolute inset-0 flex justify-between items-center px-2 sm:px-4">
                            <button onClick={handlePrevPhoto} className="bg-black/40 text-white p-2 rounded-full hover:bg-black/70 transition-colors focus:outline-none" aria-label="Previous image">{icons.chevronLeft}</button>
                            <button onClick={handleNextPhoto} className="bg-black/40 text-white p-2 rounded-full hover:bg-black/70 transition-colors focus:outline-none" aria-label="Next image">{icons.chevronRight}</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TrekDetailPage;
