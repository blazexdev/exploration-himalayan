const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.addProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ msg: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Product removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.addProductReview = async (req, res) => {
    const { rating, comment, mediaUrls } = req.body;
    const userId = req.user.id;

    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const hasPurchased = await Order.findOne({ userId, 'products.productId': req.params.id });
        if (!hasPurchased) {
            return res.status(403).json({ msg: 'You must purchase this product to leave a review.' });
        }

        const alreadyReviewed = product.reviews.find(r => r.userId.toString() === userId);
        if (alreadyReviewed) {
            return res.status(400).json({ msg: 'You have already reviewed this product.' });
        }

        const review = {
            userId,
            userName: user.name,
            userImage: user.imageUrl,
            rating: Number(rating),
            comment,
            mediaUrls,
        };

        product.reviews.unshift(review);
        await product.save();
        res.json(product);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateProductReview = async (req, res) => {
    const { rating, comment, mediaUrls } = req.body;
    const { id: productId, reviewId } = req.params;
    const userId = req.user.id;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        const review = product.reviews.id(reviewId);
        if (!review) return res.status(404).json({ msg: 'Review not found' });

        const user = await User.findById(userId);
        if (review.userId.toString() !== userId && !user.isAdmin) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        review.rating = rating;
        review.comment = comment;
        review.mediaUrls = mediaUrls;
        
        await product.save();
        res.json(product);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteProductReview = async (req, res) => {
    const { id: productId, reviewId } = req.params;
    const userId = req.user.id;

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: 'Product not found' });

        const review = product.reviews.id(reviewId);
        if (!review) return res.status(404).json({ msg: 'Review not found' });

        const user = await User.findById(userId);
        if (review.userId.toString() !== userId && !user.isAdmin) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        review.remove();
        await product.save();
        res.json(product);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};