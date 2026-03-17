import Vendor   from '../models/Vendor.js'
import User     from '../models/User.js'
import Product  from '../models/Product.js'
import Order    from '../models/Order.js'
import cloudinary from '../config/cloudinary.js'
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js'

export const applyVendor = async (req, res) => {
  try {
    const existing = await Vendor.findOne({ user: req.user._id })
    if (existing)
      return res.status(400).json({ message: 'Already applied or is a vendor' })

    const { storeName, description, phone, address } = req.body
    if (!storeName)
      return res.status(400).json({ message: 'Store name is required' })

    await User.findByIdAndUpdate(req.user._id, { role: 'vendor' })

    const vendor = await Vendor.create({
      user:        req.user._id,
      storeName,
      description: description || '',
      phone:       phone       || '',
      address:     address     || '',
      isApproved:  false,
      isActive:    true,
      commission:  Number(process.env.COMMISSION_RATE || 0.10),
    })

    res.status(201).json({
      message: 'Application submitted. Awaiting admin approval.',
      vendor,
    })
  } catch (err) {
    console.error('applyVendor error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getVendorProfile = async (req, res) => {
  try {
    res.json(req.vendor)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const updateVendorProfile = async (req, res) => {
  try {
    const updates = { ...req.body }

    if (req.file) {
      // Delete old logo from Cloudinary
      if (req.vendor.storeLogoId) {
        await cloudinary.uploader.destroy(req.vendor.storeLogoId)
      }
      // Upload new logo
      const result = await uploadToCloudinary(req.file.buffer, 'vendor-logos')
      updates.storeLogo   = result.secure_url
      updates.storeLogoId = result.public_id
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.vendor._id,
      updates,
      { new: true, runValidators: true }
    )
    res.json(vendor)
  } catch (err) {
    console.error('updateVendorProfile error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getPublicVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select('-bankDetails -pendingPayout -totalPaidOut')

    if (!vendor || !vendor.isActive)
      return res.status(404).json({ message: 'Store not found' })

    const productCount = await Product.countDocuments({
      vendor:   vendor._id,
      isActive: true,
    })

    res.json({ vendor, productCount })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.vendor._id

    const totalProducts = await Product.countDocuments({ vendor: vendorId })

    const orders        = await Order.find({ 'items.vendor': vendorId })
    const totalOrders   = orders.length
    const pendingOrders = orders.filter(o =>
      o.items.some(i => i.vendor.equals(vendorId) && i.status === 'pending')
    ).length

    // Low stock products
    const lowStock = await Product.countDocuments({
      vendor: vendorId,
      stock:  { $gt: 0, $lt: 10 },
    })

    const outOfStock = await Product.countDocuments({
      vendor: vendorId,
      stock:  0,
    })

    const salesData = await Order.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.vendor':  vendorId,
          'items.status':  { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ])

    // Recent orders
    const recentOrders = await Order.find({ 'items.vendor': vendorId })
      .populate('customer', 'name email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      totalProducts,
      totalOrders,
      pendingOrders,
      lowStock,
      outOfStock,
      totalEarnings:  req.vendor.totalEarnings || 0,
      pendingPayout:  req.vendor.pendingPayout  || 0,
      salesData,
      recentOrders,
    })
  } catch (err) {
    console.error('getVendorDashboard error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getVendorProducts = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query

    // Build filter
    const filter = { vendor: req.vendor._id }
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' }
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')  // ✅ includes slug for filtering
      .populate('vendor',   'storeName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Product.countDocuments(filter)

    res.json({
      products,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    console.error('getVendorProducts error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getVendorOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query

    const orders = await Order.find({ 'items.vendor': req.vendor._id })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    // Filter to only this vendor's items
    const filtered = orders.map(o => ({
      ...o.toObject(),
      items: o.items.filter(i =>
        i.vendor.equals(req.vendor._id) &&
        (!status || i.status === status)
      ),
    })).filter(o => o.items.length > 0)  // ✅ remove orders with no matching items

    const total = await Order.countDocuments({ 'items.vendor': req.vendor._id })

    res.json({
      orders: filtered,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    console.error('getVendorOrders error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getVendorEarnings = async (req, res) => {
  try {
    const commissionRate = Number(process.env.COMMISSION_RATE || 0.10)

    const monthly = await Order.aggregate([
      { $unwind: '$items' },
      {
        $match: {
          'items.vendor': req.vendor._id,
          paymentStatus:  'paid',
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' },
          },
          gross: {
            $sum: { $multiply: ['$items.price', '$items.quantity'] },
          },
          commission: {
            $sum: {
              $multiply: ['$items.price', '$items.quantity', commissionRate],
            },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    // Add net earnings to each month
    const monthlyWithNet = monthly.map(m => ({
      ...m,
      net: m.gross - m.commission,
    }))

    res.json({
      totalEarnings: req.vendor.totalEarnings || 0,
      pendingPayout: req.vendor.pendingPayout  || 0,
      totalPaidOut:  req.vendor.totalPaidOut   || 0,
      commissionRate,
      monthly:       monthlyWithNet,
    })
  } catch (err) {
    console.error('getVendorEarnings error:', err.message)
    res.status(500).json({ message: err.message })
  }
}