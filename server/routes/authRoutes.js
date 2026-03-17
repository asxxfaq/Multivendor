// routes/authRoutes.js
import express from 'express'
import {
  registerSendOTP,
  registerVerifyOTP,
  resendOTP,
  login,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getMe,
  updateProfile,
  updateAvatar,
  changePassword,
} from '../controllers/authController.js'
import { protect }      from '../middleware/authMiddleware.js'
import { uploadAvatar } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// ── Registration with OTP ─────────────────────
router.post('/register/send-otp',   registerSendOTP)
router.post('/register/verify-otp', registerVerifyOTP)
router.post('/register/resend-otp', resendOTP)

// ── Login ─────────────────────────────────────
router.post('/login', login)

// ── Forgot Password ───────────────────────────
router.post('/forgot-password',  forgotPassword)
router.post('/verify-reset-otp', verifyResetOTP)
router.post('/reset-password',   resetPassword)

// ── Protected routes (must be logged in) ──────
router.get('/me',                    protect, getMe)
router.put('/profile',               protect, updateProfile)
router.put('/avatar',                protect, uploadAvatar.single('avatar'), updateAvatar)
router.put('/change-password',       protect, changePassword)

export default router