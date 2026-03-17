import mongoose from 'mongoose'

const vendorSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    storeName:   { type: String, required: true },
    storeLogo:   String,
    description: String,
    isApproved:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    commission:  { type: Number, default: 0.10 },  // 10%
    bankDetails: {
      accountNo: String, ifsc: String, bankName: String
    },
    totalEarnings:  { type: Number, default: 0 },
    pendingPayout:  { type: Number, default: 0 },
  }, { timestamps: true })

  export default mongoose.model('Vendor', vendorSchema) 