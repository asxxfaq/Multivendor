import express from 'express'
import {
  applyVendor, getVendorProfile, updateVendorProfile,
  getVendorDashboard, getVendorOrders, getVendorProducts,
  getVendorEarnings, getPublicVendorProfile
} from '../controllers/vendorController.js'
import { protect } from '../middleware/authMiddleware.js'
import { isVendor } from '../middleware/roleMiddleware.js'
import { uploadAvatar } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Public
router.get('/store/:id', getPublicVendorProfile)

// Apply to become a vendor (any logged in user)
router.post('/apply', protect, applyVendor)

// Vendor protected routes
router.get('/profile',    protect, isVendor, getVendorProfile)
router.put('/profile',    protect, isVendor, uploadAvatar.single('storeLogo'), updateVendorProfile)
router.get('/dashboard',  protect, isVendor, getVendorDashboard)
router.get('/orders',     protect, isVendor, getVendorOrders)
router.get('/products',   protect, isVendor, getVendorProducts)
router.get('/earnings',   protect, isVendor, getVendorEarnings)

export default router