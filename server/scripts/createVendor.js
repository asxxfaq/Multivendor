// server/scripts/createVendor.js
import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'
import User     from '../models/User.js'
import Vendor   from '../models/Vendor.js'

const create = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    // Delete existing account with same email
    const existing = await User.findOne({ email: 'www.ashfaq0881@gmail.com' })
    if (existing) {
      await Vendor.deleteOne({ user: existing._id })
      await User.deleteOne({ _id: existing._id })
      console.log('🗑️  Removed old account')
    }

    // Create vendor user
    const user = await User.create({
      name:       'Ashfaq',
      email:      'www.ashfaq0881@gmail.com',
      password:   await bcrypt.hash('Ashfaq123', 10),
      role:       'vendor',
      isVerified: true,
      isActive:   true,
    })
    console.log('✅ Vendor user created')

    // Create vendor profile
    const vendor = await Vendor.create({
      user:        user._id,
      storeName:   'Ashfaq Store',
      description: 'Premium quality men\'s clothing and accessories',
      isApproved:  true,
      isActive:    true,
      commission:  0.10,
      totalEarnings:  0,
      pendingPayout:  0,
      totalPaidOut:   0,
    })
    console.log('✅ Vendor profile created')

    console.log('')
    console.log('══════════════════════════════════════')
    console.log('  VENDOR CREATED SUCCESSFULLY!')
    console.log('══════════════════════════════════════')
    console.log('')
    console.log('  Name     : Ashfaq')
    console.log('  Email    : www.ashfaq0881@gmail.com')
    console.log('  Password : Ashfaq123')
    console.log('  Store    : Ashfaq Store')
    console.log('  Role     : vendor')
    console.log('  Approved : yes')
    console.log('')
    console.log('  Login at : http://localhost:5173/login')
    console.log('  Dashboard: http://localhost:5173/vendor')
    console.log('══════════════════════════════════════')

    process.exit(0)

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

create()