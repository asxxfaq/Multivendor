// server/env.js
import dotenv from 'dotenv'

// Try to load .env normally. In Vercel, env vars are injected automatically,
// so if this fails to find a .env file locally, it won't crash the server.
const result = dotenv.config()

if (result.error) {
  // We don't want to log this as an error in production (Vercel) because Vercel doesn't use .env files
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ Failed to load .env file locally. Using system environment variables.')
  }
} else {
  console.log('✅ Local .env loaded successfully.')
}

console.log('MONGO_URI set:', !!process.env.MONGO_URI)
console.log('CLOUDINARY set:', !!process.env.CLOUDINARY_CLOUD_NAME)