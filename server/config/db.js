import mongoose from 'mongoose'

let isConnected = false

const connectDB = async () => {
  if (isConnected) {
    return
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in the environment variables')
    }
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    isConnected = !!conn.connections[0].readyState
    console.log(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`DB Connection Error: ${err.message}`)
    throw err
  }
}

export default connectDB