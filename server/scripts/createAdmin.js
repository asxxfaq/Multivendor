import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const email = 'admin@multishop.com'
    const password = 'Admin@123'
    
    let admin = await User.findOne({ email })
    if (admin) {
      admin.role = 'admin'
      admin.isVerified = true
      admin.isActive = true
      await admin.save()
      console.log('✅ Existing user promoted to admin:', email)
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      admin = await User.create({
        name: 'System Admin',
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true
      })
      console.log('✅ Admin user created successfully:', email)
    }

    process.exit(0)
  } catch (err) {
    console.error('❌ Error creating admin:', err)
    process.exit(1)
  }
}

createAdmin()
