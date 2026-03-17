// server.js
import './env.js'   // ← MUST be absolute first import — loads dotenv before everything

import express    from 'express'
import cors       from 'cors'
import helmet     from 'helmet'
import morgan     from 'morgan'
import connectDB  from './config/db.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

import authRoutes    from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes   from './routes/orderRoutes.js'
import vendorRoutes  from './routes/vendorRoutes.js'
import adminRoutes   from './routes/adminRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

connectDB()

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.CLIENT_URL,
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Allow any Vercel domain dynamically
    if (origin.endsWith('.vercel.app')) return callback(null, true)

    // Allow exactly matches
    if (allowedOrigins.includes(origin)) return callback(null, true)

    callback(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(morgan('dev'))

app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_, res) => res.json({ message: 'Welcome to MultiVendor API', status: 'active', time: new Date() }))
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date() }))

app.use('/api/auth',     authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders',   orderRoutes)
app.use('/api/vendor',   vendorRoutes)
app.use('/api/admin',    adminRoutes)
app.use('/api/payment',  paymentRoutes)

app.use(notFound)
app.use(errorHandler)

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Health: http://localhost:${PORT}/api/health`)
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)
  })
}

// Export the Express API for Vercel Serverless
export default app