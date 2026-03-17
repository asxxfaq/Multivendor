import express from 'express'
import {
  placeOrder, getMyOrders, getOrderById,
  cancelOrder, updateItemStatus
} from '../controllers/orderController.js'
import { protect } from '../middleware/authMiddleware.js'
import { isVendor } from '../middleware/roleMiddleware.js'

const router = express.Router()

// Customer routes
router.post('/',           protect, placeOrder)
router.get('/my',          protect, getMyOrders)
router.get('/:id',         protect, getOrderById)
router.put('/:id/cancel',  protect, cancelOrder)

// Vendor updates their own item status
router.put('/:orderId/items/:itemId/status', protect, isVendor, updateItemStatus)

export default router