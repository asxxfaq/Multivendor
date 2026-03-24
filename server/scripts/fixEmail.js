import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import User from '../models/User.js'

const fixEmail = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  
  // Find the weird www email
  const user = await User.findOne({ email: 'www.ashfaq088@gmail.com' })
  if (user) {
    user.email = 'ashfaq088@gmail.com'
    await user.save()
    console.log('✅ Email updated to ashfaq088@gmail.com')
  } else {
    // Check if the correct one already exists
    const correctUser = await User.findOne({ email: 'ashfaq088@gmail.com' })
    if (correctUser) {
        console.log('✅ User already exists as ashfaq088@gmail.com')
    } else {
        console.log('❌ User not found with either email')
    }
  }
  process.exit(0)
}
fixEmail()
