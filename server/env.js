// server/env.js
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

// Load .env from the server folder explicitly
const result = dotenv.config({ path: resolve(__dirname, '.env') })

if (result.error) {
  console.error('❌ Failed to load .env file:', result.error.message)
} else {
  console.log('✅ .env loaded from:', resolve(__dirname, '.env'))
  console.log('MONGO_URI set:', !!process.env.MONGO_URI)
  console.log('CLOUDINARY set:', !!process.env.CLOUDINARY_CLOUD_NAME)
}