import express from 'express'
import {
  getAllUsers, getUserById, updateUser, deleteUser,
  getAllVendors, approveVendor, rejectVendor, toggleVendorStatus,
  getAllOrders, updateOrderStatus, getAnalytics,
  getCategories, createCategory, updateCategory, deleteCategory
} from '../controllers/adminController.js'
import { protect } from '../middleware/authMiddleware.js'
import { isAdmin } from '../middleware/roleMiddleware.js'
import { uploadProduct } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// ✅ PUBLIC — must be BEFORE router.use(protect, isAdmin)
router.get('/categories', getCategories)

// ── All routes below require admin login ──────
router.use(protect, isAdmin)

// Users
router.get('/users',        getAllUsers)
router.get('/users/:id',    getUserById)
router.put('/users/:id',    updateUser)
router.delete('/users/:id', deleteUser)

// Vendors
router.get('/vendors',             getAllVendors)
router.put('/vendors/:id/approve', approveVendor)
router.put('/vendors/:id/reject',  rejectVendor)
router.put('/vendors/:id/toggle',  toggleVendorStatus)

// Orders
router.get('/orders',     getAllOrders)
router.put('/orders/:id', updateOrderStatus)

// Analytics
router.get('/analytics', getAnalytics)

// Categories — admin only for create/update/delete
router.post('/categories',       uploadProduct.single('image'), createCategory)
router.put('/categories/:id',    uploadProduct.single('image'), updateCategory)
router.delete('/categories/:id', deleteCategory)

export default router