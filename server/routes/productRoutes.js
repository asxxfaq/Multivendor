import express from 'express'
import {
  getProducts, getProduct, searchProducts, getFeatured,
  addProduct, updateProduct, deleteProduct,
  addReview, getProductReviews, deleteReview,
  toggleWishlist
} from '../controllers/productController.js'
import { protect }  from '../middleware/authMiddleware.js'
import { isVendor } from '../middleware/roleMiddleware.js'
import { uploadProduct } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// ── Public routes ─────────────────────────────
router.get('/',         getProducts)   // GET /api/products
router.get('/featured', getFeatured)   // GET /api/products/featured
router.get('/search',   searchProducts) // GET /api/products/search?q=shirt

// ── Vendor only (POST must be before /:id routes) ──
router.post('/', protect, isVendor, uploadProduct.array('images', 5), addProduct)

// ── Single product by ID ──────────────────────
router.get('/:id',         getProduct)          // GET /api/products/:id
router.get('/:id/reviews', getProductReviews)   // GET /api/products/:id/reviews

// ── Customer protected ────────────────────────
router.post('/:id/reviews',        protect, addReview)
router.delete('/:id/reviews/:rid', protect, deleteReview)
router.post('/:id/wishlist',       protect, toggleWishlist)

// ── Vendor only ───────────────────────────────
router.put('/:id',    protect, isVendor, uploadProduct.array('images', 5), updateProduct)
router.delete('/:id', protect, isVendor, deleteProduct)

export default router