// server/scripts/fixVendor.js
import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import User from '../models/User.js'
import Vendor from '../models/Vendor.js'

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    // Find all vendor users
    const vendorUsers = await User.find({ role: 'vendor' })
    console.log(`Found ${vendorUsers.length} vendor users`)

    for (const user of vendorUsers) {
      // Check if vendor profile exists
      const existing = await Vendor.findOne({ user: user._id })

      if (!existing) {
        // Create missing vendor profile
        const vendor = await Vendor.create({
          user:        user._id,
          storeName:   user.name + "'s Store",
          description: 'Welcome to our store',
          isApproved:  true,
          isActive:    true,
          commission:  0.10,
        })
        console.log(`✅ Created vendor profile for: ${user.email} → ${vendor.storeName}`)
      } else {
        // Make sure it is approved
        if (!existing.isApproved) {
          existing.isApproved = true
          await existing.save()
          console.log(`✅ Approved vendor: ${user.email}`)
        } else {
          console.log(`✅ Vendor profile already exists: ${user.email} → ${existing.storeName}`)
        }
      }
    }

    console.log('')
    console.log('Done! All vendor profiles fixed.')
    process.exit(0)

  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

fix()