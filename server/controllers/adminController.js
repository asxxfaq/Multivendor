import User from '../models/User.js'
import Vendor from '../models/Vendor.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'
import Category from '../models/Category.js'
import cloudinary from '../config/cloudinary.js'

// ─── Users ────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 20, role } = req.query
  const filter = role ? { role } : {}
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
  const total = await User.countDocuments(filter)
  res.json({ users, total })
}

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
}

export const updateUser = async (req, res) => {
  const { name, role, isActive } = req.body
  const user = await User.findByIdAndUpdate(
    req.params.id, { name, role, isActive }, { new: true }
  )
  res.json(user)
}

export const deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: false })
  res.json({ message: 'User deactivated' })
}

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate admin accounts' })
    }
    user.isActive = !user.isActive
    await user.save()
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user })
  } catch (err) {
    console.error('toggleUserStatus error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

// ─── Vendors ──────────────────────────────────────────
export const getAllVendors = async (req, res) => {
  const { approved, page = 1, limit = 20 } = req.query
  const filter = {}
  if (approved === 'true')  filter.isApproved = true
  if (approved === 'false') filter.isApproved = false
  const vendors = await Vendor.find(filter)
    .populate('user', 'name email phone')
    .sort({ createdAt: -1 })
    .limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
  const total = await Vendor.countDocuments(filter)
  res.json({ vendors, total })
}

export const approveVendor = async (req, res) => {
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { isApproved: true, rejectedReason: '' },
    { new: true }
  ).populate('user', 'name email')
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
  // TODO: send approval email via Nodemailer here
  res.json({ message: `${vendor.storeName} approved`, vendor })
}

export const rejectVendor = async (req, res) => {
  const { reason = 'Does not meet requirements' } = req.body
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { isApproved: false, rejectedReason: reason },
    { new: true }
  )
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
  // Revert user role back to customer
  await User.findByIdAndUpdate(vendor.user, { role: 'customer' })
  res.json({ message: 'Vendor rejected', vendor })
}

export const toggleVendorStatus = async (req, res) => {
  const vendor = await Vendor.findById(req.params.id)
  if (!vendor) return res.status(404).json({ message: 'Vendor not found' })
  vendor.isActive = !vendor.isActive
  await vendor.save()
  res.json({ message: `Vendor ${vendor.isActive ? 'activated' : 'deactivated'}`, vendor })
}

// ─── Orders ───────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  const { page = 1, limit = 20, paymentStatus } = req.query
  const filter = paymentStatus ? { paymentStatus } : {}
  const orders = await Order.find(filter)
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit)).skip((Number(page) - 1) * Number(limit))
  const total = await Order.countDocuments(filter)
  res.json({ orders, total })
}

export const updateOrderStatus = async (req, res) => {
  const { paymentStatus } = req.body
  const order = await Order.findByIdAndUpdate(
    req.params.id, { paymentStatus }, { new: true }
  )
  res.json(order)
}

// ─── Analytics ────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  const [totalUsers, totalVendors, totalProducts, totalOrders] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Vendor.countDocuments({ isApproved: true }),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments()
  ])

  const revenueAgg = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$platformFee' } } }
  ])
  const totalRevenue = revenueAgg[0]?.total || 0

  const monthlySales = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders:  { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 }
  ])

  const topProducts = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $project: { 'product.name': 1, 'product.images': 1, totalSold: 1 } }
  ])

  res.json({ totalUsers, totalVendors, totalProducts, totalOrders, totalRevenue, monthlySales, topProducts })
}

// ─── Categories ───────────────────────────────────────
export const getCategories = async (req, res) => {
  const categories = await Category.find().populate('parent', 'name').sort({ order: 1 })
  res.json(categories)
}

export const createCategory = async (req, res) => {
  const { name, description, parent, order } = req.body
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const image   = req.file?.path     || ''
  const imageId = req.file?.filename || ''
  const category = await Category.create({ name, slug, description, parent: parent || null, image, imageId, order })
  res.status(201).json(category)
}

export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) return res.status(404).json({ message: 'Category not found' })
  const updates = { ...req.body }
  if (req.file) {
    if (category.imageId) await cloudinary.uploader.destroy(category.imageId)
    updates.image   = req.file.path
    updates.imageId = req.file.filename
  }
  if (updates.name) updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-')
  const updated = await Category.findByIdAndUpdate(req.params.id, updates, { new: true })
  res.json(updated)
}

export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) return res.status(404).json({ message: 'Category not found' })
  if (category.imageId) await cloudinary.uploader.destroy(category.imageId)
  await category.deleteOne()
  res.json({ message: 'Category deleted' })
}

// ─── Products (Admin) ──────────────────────────────────
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query

    const filter = {}
    if (search && search.trim()) {
      const cleanSearch = search.trim()
      const searchRegex = { $regex: cleanSearch, $options: 'i' }
      
      const searchOr = [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex },
        { 'variants.color': searchRegex }
      ]

      const numericSearch = parseFloat(cleanSearch)
      if (!isNaN(numericSearch)) {
        searchOr.push({ price: { $lte: numericSearch } })
      }

      filter.$and = filter.$and || []
      filter.$and.push({ $or: searchOr })
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('vendor', 'storeName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))

    const total = await Product.countDocuments(filter)

    // Calculate stats for admin products
    const active = await Product.countDocuments({ isActive: true })
    const hidden = await Product.countDocuments({ isActive: false })
    const outOfStock = await Product.countDocuments({ stock: 0 })
    const totalCount = await Product.countDocuments()

    res.json({
      products,
      total,
      active,
      hidden,
      outOfStock,
      totalCount,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    console.error('getAllProducts error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    product.isActive = !product.isActive
    await product.save()
    res.json({ message: `Product status updated`, product })
  } catch (err) {
    console.error('toggleProductStatus error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    // Delete images from Cloudinary if they exist
    if (product.imageIds && product.imageIds.length > 0) {
      await Promise.all(
        product.imageIds.map(id => cloudinary.uploader.destroy(id))
      )
    }

    await product.deleteOne()
    res.json({ message: 'Product deleted successfully' })
  } catch (err) {
    console.error('deleteProduct admin error:', err.message)
    res.status(500).json({ message: err.message })
  }
}