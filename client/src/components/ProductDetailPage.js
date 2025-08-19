import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import api from '../services/api';

const icons = {
    chevronLeft: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
    chevronRight: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
    moreVertical: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>,
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

const ProductDetailPage = ({ product, currentUser, orders = [], onNewOrder, onProductUpdate, setPage }) => {
    const [selectedImage, setSelectedImage] = useState(product.imageUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [shippingDetails, setShippingDetails] = useState({ name: '', email: '', phone: '', address: '' });
    const [reviewError, setReviewError] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewMedia, setReviewMedia] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [editMedia, setEditMedia] = useState([]);
    const [activeReviewMenu, setActiveReviewMenu] = useState(null);

    useEffect(() => {
        if (currentUser) {
            setShippingDetails({
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                address: currentUser.address || '',
            });
        }
    }, [currentUser]);

    const hasPurchased = useMemo(() => {
        if (!currentUser || !orders || !Array.isArray(orders)) {
            return false;
        }
        return orders.some(order => 
            order &&
            order.userEmail === currentUser.email && 
            order.products && Array.isArray(order.products) &&
            order.products.some(p => p && p.productId === product._id)
        );
    }, [orders, currentUser, product]);

    const hasReviewed = useMemo(() => {
        if (!currentUser || !product.reviews) return false;
        return product.reviews.some(r => r.userId === currentUser._id);
    }, [product.reviews, currentUser]);

    const handleBuyNowClick = () => {
        if (!currentUser) {
            setPage({ name: 'login' });
            return;
        }
        setIsCheckoutModalOpen(true);
    };

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleProceedToPayment = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data: { order } } = await api.createRazorpayOrder(product.price, null, true);
            
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "Exploration Himalayan Shop",
                description: `Order for ${product.name}`,
                image: product.imageUrl,
                order_id: order.id,
                handler: async function (response) {
                    const paymentData = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: order.amount,
                        product: product,
                        shippingDetails: shippingDetails,
                    };
                    
                    const { data } = await api.verifyProductPayment(paymentData);
                    if (data.success) {
                        alert('Payment successful! Your order has been placed.');
                        onNewOrder(data.order);
                        setIsCheckoutModalOpen(false);
                    } else {
                        setError('Payment verification failed.');
                    }
                },
                prefill: {
                    name: shippingDetails.name,
                    email: shippingDetails.email,
                    contact: shippingDetails.phone,
                },
                theme: { color: "#0d9488" },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            setError('Could not initiate payment. Please try again.');
        } finally {
            setIsLoading(false);
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
            const res = await api.addProductReview(product._id, {
                rating: reviewRating,
                comment: reviewComment,
                mediaUrls: reviewMedia,
            });
            if (res.data) {
                onProductUpdate(res.data);
                setReviewRating(0);
                setReviewComment('');
                setReviewMedia([]);
            }
        } catch (err) {
            setReviewError(err.response?.data?.msg || 'Failed to submit review.');
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
            const res = await api.updateProductReview(product._id, editingReviewId, {
                rating: editRating,
                comment: editComment,
                mediaUrls: editMedia,
            });
            if (res.data) {
                onProductUpdate(res.data);
                setEditingReviewId(null);
            }
        } catch (err) {
            setReviewError(err.response?.data?.msg || 'Failed to update review.');
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                const res = await api.deleteProductReview(product._id, reviewId);
                onProductUpdate(res.data);
            } catch (err) {
                setReviewError(err.response?.data?.msg || 'Failed to delete review.');
            }
        }
    };

    const handleNextPhoto = (e) => {
        e.stopPropagation();
        const photoList = [product.imageUrl, ...product.images];
        setSelectedImageIndex((prevIndex) => (prevIndex + 1) % photoList.length);
    };

    const handlePrevPhoto = (e) => {
        e.stopPropagation();
        const photoList = [product.imageUrl, ...product.images];
        setSelectedImageIndex((prevIndex) => (prevIndex - 1 + photoList.length) % photoList.length);
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div>
                        <img src={selectedImage} alt={product.name} className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg mb-4" />
                        <div className="grid grid-cols-4 gap-2">
                            {[product.imageUrl, ...product.images].map((img, index) => (
                                <img key={index} src={img} onClick={() => setSelectedImage(img)} className={`w-full h-24 object-cover rounded-md cursor-pointer border-2 ${selectedImage === img ? 'border-teal-500' : 'border-transparent'}`} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{product.name}</h1>
                        <p className="text-3xl font-bold text-teal-500 dark:text-teal-400 mb-6">₹{product.price.toLocaleString('en-IN')}</p>
                        <div className="prose dark:prose-invert max-w-none mb-8">
                            <p>{product.description}</p>
                        </div>
                        <button onClick={handleBuyNowClick} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600">
                            Buy Now
                        </button>
                    </div>
                </div>
                <div className="mt-16">
                    <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
                    {hasPurchased && !hasReviewed && (
                        <form onSubmit={handleReviewSubmit} className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg mb-8 border dark:border-gray-700">
                            <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
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
                        {product.reviews && product.reviews.length > 0 ? product.reviews.map(review => (
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
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : <p className="text-gray-500">No reviews for this product yet.</p>}
                    </div>
                </div>
            </div>
            <Modal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} size="lg">
                <h2 className="text-2xl font-bold text-center mb-6">Shipping Details</h2>
                <form onSubmit={handleProceedToPayment} className="space-y-4">
                    <input type="text" name="name" placeholder="Full Name" value={shippingDetails.name} onChange={handleShippingChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                    <input type="email" name="email" placeholder="Email Address" value={shippingDetails.email} onChange={handleShippingChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                    <input type="tel" name="phone" placeholder="Phone Number" value={shippingDetails.phone} onChange={handleShippingChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                    <textarea name="address" placeholder="Full Shipping Address" value={shippingDetails.address} onChange={handleShippingChange} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" rows="3" required></textarea>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">
                        {isLoading ? 'Processing...' : `Proceed to Pay ₹${product.price.toLocaleString('en-IN')}`}
                    </button>
                </form>
            </Modal>
            <Modal isOpen={selectedImageIndex !== null} onClose={() => setSelectedImageIndex(null)} size="4xl">
                {selectedImageIndex !== null && (
                    <div className="relative">
                        <img 
                            src={[product.imageUrl, ...product.images][selectedImageIndex]}
                            alt="Product enlarged" 
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

export default ProductDetailPage;
