import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'
import Category from './models/Category.js'

dotenv.config({ path: './.env' })

const run = async () => {
  try {
    console.log('Connecting to:', process.env.MONGO_URI.replace(/:([^:@]+)@/, ':***@'))
    await mongoose.connect(process.env.MONGO_URI)
    
    const catCount = await Category.countDocuments()
    const prodCount = await Product.countDocuments()
    const activeProdCount = await Product.countDocuments({ isActive: true })
    const featuredCount = await Product.countDocuments({ isFeatured: true })

    console.log('--- DATABASE STATS ---')
    console.log('Categories:', catCount)
    console.log('Total Products:', prodCount)
    console.log('Active Products:', activeProdCount)
    console.log('Featured Products:', featuredCount)
    
    if (catCount > 0) {
      const cats = await Category.find().limit(5)
      console.log('Sample Categories:', cats.map(c => c.name))
    }

    if (prodCount > 0) {
      const prods = await Product.find().limit(5)
      console.log('Sample Products:', prods.map(p => p.name))
    }

    process.exit(0)
  } catch (err) {
    console.error('DIAGNOSTIC FAILED:', err)
    process.exit(1)
  }
}
run()
