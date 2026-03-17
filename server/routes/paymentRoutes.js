import express from 'express'
import {
  createPaymentOrder, verifyPayment, handleWebhook
} from '../controllers/paymentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/create-order', protect, createPaymentOrder)
router.post('/verify',       protect, verifyPayment)

// Webhook — raw body needed, no JSON parser
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook)

export default router