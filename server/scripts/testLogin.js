import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'

const testLogin = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  const email = 'www.ashfaq088@gmail.com'
  const password = 'Ashfaq123'
  
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    console.log('❌ User not found')
    process.exit(1)
  }
  
  console.log('✅ User found')
  console.log('isVerified:', user.isVerified)
  console.log('isActive:', user.isActive)
  
  const isMatch = await bcrypt.compare(password, user.password)
  console.log('Password match:', isMatch)
  
  process.exit(0)
}
testLogin()
