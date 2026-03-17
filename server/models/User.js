// models/User.js
import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema({
  label:     { type: String, default: 'Home' },
  street:    { type: String },
  city:      { type: String },
  state:     { type: String },
  pincode:   { type: String },
  isDefault: { type: Boolean, default: false },
})

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // ✅ keep select:false only here

  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin'],
    default: 'customer',
  },

  // ── Verification ─────────────────────────
  isVerified:  { type: Boolean, default: false },
  otp:         { type: String  },   // ✅ removed select:false
  otpExpires:  { type: Number  },   // ✅ removed select:false

  // ── Password Reset ────────────────────────
  resetOtp:          { type: String  },  // ✅ removed select:false
  resetOtpExpires:   { type: Number  },  // ✅ removed select:false
  resetToken:        { type: String  },  // ✅ removed select:false
  resetTokenExpires: { type: Number  },  // ✅ removed select:false

  // ── Profile ───────────────────────────────
  phone:     { type: String, default: '' },
  avatar:    { type: String, default: '' },
  avatarId:  { type: String, default: '' },
  addresses: [addressSchema],
  wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  isActive: { type: Boolean, default: true },

}, { timestamps: true })

export default mongoose.model('User', userSchema)