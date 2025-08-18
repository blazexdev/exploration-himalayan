const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', [authMiddleware, adminMiddleware], productController.addProduct);
router.put('/:id', [authMiddleware, adminMiddleware], productController.updateProduct);
router.delete('/:id', [authMiddleware, adminMiddleware], productController.deleteProduct);

// User review routes
router.post('/:id/reviews', authMiddleware, productController.addProductReview);
router.put('/:id/reviews/:reviewId', authMiddleware, productController.updateProductReview);
router.delete('/:id/reviews/:reviewId', authMiddleware, productController.deleteProductReview);

module.exports = router;