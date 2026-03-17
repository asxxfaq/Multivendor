// controllers/authController.js
import User       from '../models/User.js'
import jwt        from 'jsonwebtoken'
import bcrypt     from 'bcryptjs'
import crypto     from 'crypto'
import cloudinary from '../config/cloudinary.js'
import { sendEmail } from '../utils/sendEmail.js'

// ── Helpers ───────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

// ═══════════════════════════════════════════════
//  REGISTER — Step 1: send OTP
// ═══════════════════════════════════════════════
export const registerSendOTP = async (req, res) => {
  try {
    const { name, email, password, role = 'customer' } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' })

    const exists = await User.findOne({ email, isVerified: true })
    if (exists)
      return res.status(400).json({ message: 'Email already registered' })

    const safeRole       = role === 'admin' ? 'customer' : role
    const otp            = generateOTP()
    const expires        = Date.now() + 10 * 60 * 1000
    const hashedPassword = await bcrypt.hash(password, 10)

    await User.deleteOne({ email, isVerified: false })

    await User.create({
      name,
      email,
      password:   hashedPassword,
      role:       safeRole,
      otp,
      otpExpires: expires,
      isVerified: false,
    })

    console.log(`OTP for ${email}: ${otp}`)

    await sendEmail({
      to:      email,
      subject: 'Your Verification OTP — MultiShop',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfaf4;border:1px solid #e8e6e1">
          <h2 style="color:#6B0F1A">Email Verification</h2>
          <p style="color:#5c5750;margin-bottom:24px">Use the OTP below to verify your account. Expires in <strong>10 minutes</strong>.</p>
          <div style="background:#6B0F1A;color:#fff;font-size:2.5rem;font-weight:700;letter-spacing:12px;text-align:center;padding:20px 32px;border-radius:4px">${otp}</div>
          <p style="color:#857f74;font-size:0.8125rem;margin-top:20px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    res.status(200).json({ message: 'OTP sent to your email', email })
  } catch (err) {
    console.error('Register OTP error:', err.message)
    res.status(500).json({ message: err.message || 'Server error' })
  }
}

// ═══════════════════════════════════════════════
//  REGISTER — Step 2: verify OTP
// ═══════════════════════════════════════════════
export const registerVerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' })

    const user = await User.findOne({ email, isVerified: false })

    if (!user)
      return res.status(400).json({ message: 'No pending registration found. Please register again.' })

    if (user.otp !== otp.toString().trim())
      return res.status(400).json({ message: 'Invalid OTP' })

    if (Date.now() > user.otpExpires)
      return res.status(400).json({ message: 'OTP has expired. Please register again.' })

    user.isVerified = true
    user.otp        = undefined
    user.otpExpires = undefined
    await user.save()

    const token = generateToken(user._id)

    res.status(201).json({
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      role:   user.role,
      avatar: user.avatar || '',
      token,
    })
  } catch (err) {
    console.error('Verify OTP error:', err.message)
    res.status(500).json({ message: err.message || 'Server error' })
  }
}

// ═══════════════════════════════════════════════
//  RESEND OTP
// ═══════════════════════════════════════════════
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email, isVerified: false })
    if (!user)
      return res.status(400).json({ message: 'No pending registration for this email' })

    const otp     = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000

    user.otp        = otp
    user.otpExpires = expires
    await user.save()

    await sendEmail({
      to:      email,
      subject: 'Your New OTP — MultiShop',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfaf4;border:1px solid #e8e6e1">
          <h2 style="color:#6B0F1A">New OTP</h2>
          <p style="color:#5c5750">Your new verification code (valid 10 minutes):</p>
          <div style="background:#6B0F1A;color:#fff;font-size:2.5rem;font-weight:700;letter-spacing:12px;text-align:center;padding:20px 32px;border-radius:4px">${otp}</div>
        </div>
      `,
    })

    res.json({ message: 'New OTP sent' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' })
  }
}

// ═══════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' })

    if (!user.isVerified)
      return res.status(401).json({
        message:           'Email not verified. Please complete OTP verification.',
        needsVerification: true,
        email,
      })

    if (!user.isActive)
      return res.status(403).json({ message: 'Your account has been deactivated. Contact support.' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' })

    const token = generateToken(user._id)

    const redirectMap = { admin: '/admin', vendor: '/vendor', customer: '/' }

    res.json({
      _id:      user._id,
      name:     user.name,
      email:    user.email,
      role:     user.role,
      avatar:   user.avatar || '',
      phone:    user.phone  || '',
      token,
      redirect: redirectMap[user.role] || '/',
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ message: err.message || 'Server error' })
  }
}

// ═══════════════════════════════════════════════
//  FORGOT PASSWORD — Step 1: send OTP
// ═══════════════════════════════════════════════
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email, isVerified: true })
    if (!user)
      return res.status(404).json({ message: 'No verified account found with this email' })

    const otp     = generateOTP()
    const expires = Date.now() + 15 * 60 * 1000

    user.resetOtp        = otp
    user.resetOtpExpires = expires
    await user.save()

    await sendEmail({
      to:      email,
      subject: 'Password Reset OTP — MultiShop',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfaf4;border:1px solid #e8e6e1">
          <h2 style="color:#6B0F1A">Reset Your Password</h2>
          <p style="color:#5c5750;margin-bottom:24px">Use this OTP to reset your password. Valid for <strong>15 minutes</strong>.</p>
          <div style="background:#6B0F1A;color:#fff;font-size:2.5rem;font-weight:700;letter-spacing:12px;text-align:center;padding:20px 32px;border-radius:4px">${otp}</div>
          <p style="color:#857f74;font-size:0.8125rem;margin-top:20px">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    res.json({ message: 'Password reset OTP sent to your email', email })
  } catch (err) {
    console.error('Forgot password error:', err.message)
    res.status(500).json({ message: err.message || 'Server error' })
  }
}

// ═══════════════════════════════════════════════
//  FORGOT PASSWORD — Step 2: verify OTP
// ═══════════════════════════════════════════════
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    const user = await User.findOne({ email })
    if (!user)
      return res.status(404).json({ message: 'User not found' })

    if (!user.resetOtp)
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' })

    if (user.resetOtp !== otp.toString().trim())
      return res.status(400).json({ message: 'Invalid OTP' })

    if (Date.now() > user.resetOtpExpires)
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })

    const resetToken        = crypto.randomBytes(32).toString('hex')
    user.resetToken         = resetToken
    user.resetTokenExpires  = Date.now() + 10 * 60 * 1000
    user.resetOtp           = undefined
    user.resetOtpExpires    = undefined
    await user.save()

    res.json({ message: 'OTP verified', resetToken, email })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' })
  }
}

// ═══════════════════════════════════════════════
//  FORGOT PASSWORD — Step 3: reset password
// ═══════════════════════════════════════════════
export const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body

    const user = await User.findOne({ email })
    if (!user)
      return res.status(404).json({ message: 'User not found' })

    if (user.resetToken !== resetToken)
      return res.status(400).json({ message: 'Invalid reset token' })

    if (Date.now() > user.resetTokenExpires)
      return res.status(400).json({ message: 'Reset token expired. Please start again.' })

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    user.password          = await bcrypt.hash(newPassword, 10)
    user.resetToken        = undefined
    user.resetTokenExpires = undefined
    await user.save()

    await sendEmail({
      to:      email,
      subject: 'Password Changed — MultiShop',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fdfaf4;border:1px solid #e8e6e1">
          <h2 style="color:#6B0F1A">Password Changed Successfully</h2>
          <p style="color:#5c5750">Your password has been reset. You can now log in with your new password.</p>
          <p style="color:#857f74;font-size:0.8125rem;margin-top:16px">If you didn't do this, contact support immediately.</p>
        </div>
      `,
    })

    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' })
  }
}

// ═══════════════════════════════════════════════
//  GET ME
// ═══════════════════════════════════════════════
export const getMe = async (req, res) => {
  try {
    res.json(req.user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ═══════════════════════════════════════════════
//  UPDATE PROFILE
// ═══════════════════════════════════════════════
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body

    if (!name?.trim())
      return res.status(400).json({ message: 'Name is required' })

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), phone: phone?.trim() || '' },
      { new: true, runValidators: true }
    )

    res.json({
      _id:    user._id,
      name:   user.name,
      email:  user.email,
      phone:  user.phone,
      role:   user.role,
      avatar: user.avatar || '',
    })
  } catch (err) {
    console.error('updateProfile error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

// ═══════════════════════════════════════════════
//  UPDATE AVATAR
// ═══════════════════════════════════════════════
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: 'No image file provided' })

    const user = await User.findById(req.user._id)
    if (!user)
      return res.status(404).json({ message: 'User not found' })

    // Delete old avatar from Cloudinary
    if (user.avatarId) {
      try {
        await cloudinary.uploader.destroy(user.avatarId)
      } catch (e) {
        console.warn('Could not delete old avatar:', e.message)
      }
    }

    // Upload new avatar
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error)
          else       resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    user.avatar   = result.secure_url
    user.avatarId = result.public_id
    await user.save()

    res.json({
      _id:      user._id,
      name:     user.name,
      email:    user.email,
      phone:    user.phone  || '',
      role:     user.role,
      avatar:   user.avatar,
      avatarId: user.avatarId,
    })
  } catch (err) {
    console.error('updateAvatar error:', err.message)
    res.status(500).json({ message: err.message || 'Avatar upload failed' })
  }
}

// ═══════════════════════════════════════════════
//  CHANGE PASSWORD (logged in user)
//  ✅ Only ONE definition — duplicate removed
// ═══════════════════════════════════════════════
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords are required' })

    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' })

    const user = await User.findById(req.user._id).select('+password')
    if (!user)
      return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch)
      return res.status(400).json({ message: 'Current password is incorrect' })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    console.error('changePassword error:', err.message)
    res.status(500).json({ message: err.message })
  }
}