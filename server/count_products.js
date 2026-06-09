import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    const count = await mongoose.connection.db.collection('products').countDocuments()
    const activeCount = await mongoose.connection.db.collection('products').countDocuments({ isActive: true })
    const catCount = await mongoose.connection.db.collection('categories').countDocuments()
    console.log('TOTAL_PRODUCTS:', count)
    console.log('ACTIVE_PRODUCTS:', activeCount)
    console.log('TOTAL_CATEGORIES:', catCount)
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
run()
