// controllers/paymentController.js
import crypto from 'crypto'
import Razorpay from 'razorpay'
import Order from '../models/Order.js'

// Try to initialize Razorpay, but handle missing keys gracefully at runtime
let razorpay
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }
} catch (e) {
  console.log('Razorpay initialization skipped or failed:', e.message)
}

export const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body

    if (!razorpay) {
      return res.status(500).json({ message: 'Razorpay keys are not configured in backend' })
    }

    const options = {
      amount: amount * 100, // exact amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: 'rcpt_' + Date.now(),
    }

    const order = await razorpay.orders.create(options)

    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      key:      process.env.RAZORPAY_KEY_ID
    })
  } catch (err) {
    console.error('Error creating Razorpay order:', err)
    res.status(500).json({ message: 'Error establishing payment connection' })
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, paymentId: razorpay_payment_id })
    } else {
      res.json({ success: false, message: 'Invalid payment signature' })
    }
  } catch (err) {
    console.error('Error verifying payment:', err)
    res.status(500).json({ success: false, message: 'Verification error' })
  }
}

export const handleWebhook = async (req, res) => {
  res.json({ received: true })
}