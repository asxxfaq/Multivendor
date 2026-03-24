import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    const dbName = mongoose.connection.db.databaseName
    console.log('Connected to DB:', dbName)
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    const userCount = await mongoose.connection.db.collection('users').countDocuments()
    const categoryCount = await mongoose.connection.db.collection('categories').countDocuments()
    const vendorCount = await mongoose.connection.db.collection('vendors').countDocuments()
    const productCount = await mongoose.connection.db.collection('products').countDocuments()
    console.log('User count:', userCount)
    console.log('Category count:', categoryCount)
    console.log('Vendor count:', vendorCount)
    console.log('Product count:', productCount)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

checkDB()
