import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const fixPassword = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  const user = await User.findOne({ email: 'www.ashfaq088@gmail.com' })
  if (user) {
    user.password = await bcrypt.hash('Ashfaq123', 10)
    await user.save()
    console.log('✅ Password updated to Ashfaq123')
  } else {
    console.log('❌ User not found')
  }
  process.exit(0)
}
fixPassword()
