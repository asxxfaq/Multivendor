import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Review from '../models/Review.js'
import Order from '../models/Order.js'
import mongoose from 'mongoose'
import cloudinary from '../config/cloudinary.js'
import { uploadToCloudinary } from '../middleware/uploadMiddleware.js'

export const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sort, page = 1, limit = 12, vendor } = req.query
    const filter = { isActive: true }

    if (category) {
      // Check if it's a valid 24-char ObjectId
      if (mongoose.Types.ObjectId.isValid(category) && String(category).length === 24) {
        filter.category = category
      } else {
        const catDoc = await Category.findOne({ slug: category })
        if (catDoc) {
          filter.category = catDoc._id
        } else {
          // If category slug doesn't exist, return empty results
          return res.json({ products: [], total: 0, page: Number(page), pages: 0 })
        }
      }
    }
    if (vendor) filter.vendor = vendor
    if (minPrice || maxPrice) filter.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) })
    }
    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'rating': { 'ratings.average': -1 },
      'newest': { createdAt: -1 }
    }
    const products = await Product.find(filter)
      .populate('vendor', 'storeName storeLogo')
      .populate('category', 'name slug')
      .sort(sortMap[sort] || { createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
    const total = await Product.countDocuments(filter)
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    console.error('getProducts error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('vendor', 'storeName')
      .populate('category', 'name slug')
      .limit(10)
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const searchProducts = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query
    if (!q) return res.status(400).json({ message: 'Search query required' })
    const products = await Product.find(
      { $text: { $search: q }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .populate('vendor', 'storeName')
      .populate('category', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
    const total = await Product.countDocuments({ $text: { $search: q }, isActive: true })
    res.json({ products, total })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'storeName storeLogo description ratings')
      .populate('category', 'name slug')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const addProduct = async (req, res) => {
  try {
    // ── Validate images ──────────────────────
    if (!req.files?.length)
      return res.status(400).json({ message: 'At least one image is required' })

    // ── Validate required fields ─────────────
    if (!req.body.name?.trim())
      return res.status(400).json({ message: 'Product name is required' })

    if (!req.body.price || Number(req.body.price) <= 0)
      return res.status(400).json({ message: 'Please enter a valid price' })

    // ── Validate category ────────────────────
    if (!req.body.category || req.body.category.trim() === '')
      return res.status(400).json({ message: 'Please select a category' })

    // ── Upload images to Cloudinary ──────────
    const uploaded = await Promise.all(
      req.files.map(f => uploadToCloudinary(f.buffer, 'products'))
    )
    const images = uploaded.map(r => r.secure_url)
    const imageIds = uploaded.map(r => r.public_id)

    // ── Create product ───────────────────────
    const product = await Product.create({
      name: req.body.name.trim(),
      description: req.body.description?.trim() || '',
      price: Number(req.body.price),
      comparePrice: Number(req.body.comparePrice) || 0,
      stock: Number(req.body.stock) || 0,
      category: req.body.category,
      tags: req.body.tags
        ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)
        : [],
      vendor: req.vendor._id,
      images,
      imageIds,
      isActive: true,
      isFeatured: req.body.isFeatured === 'true',
    })

    res.status(201).json(product)
  } catch (err) {
    console.error('addProduct error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product)
      return res.status(404).json({ message: 'Product not found' })

    if (!product.vendor.equals(req.vendor._id))
      return res.status(403).json({ message: 'Not your product' })

    // ── Validate category if provided ────────
    if (req.body.category !== undefined && req.body.category.trim() === '')
      return res.status(400).json({ message: 'Please select a valid category' })

    let images = product.images
    let imageIds = product.imageIds

    if (req.files?.length) {
      // Delete old images from Cloudinary
      if (product.imageIds?.length) {
        await Promise.all(product.imageIds.map(id => cloudinary.uploader.destroy(id)))
      }
      // Upload new images
      const uploaded = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.buffer, 'products'))
      )
      images = uploaded.map(r => r.secure_url)
      imageIds = uploaded.map(r => r.public_id)
    }

    // Build update object — only include fields that were sent
    const updateData = {
      images,
      imageIds,
    }
    if (req.body.name) updateData.name = req.body.name.trim()
    if (req.body.description) updateData.description = req.body.description.trim()
    if (req.body.price) updateData.price = Number(req.body.price)
    if (req.body.comparePrice !== undefined) updateData.comparePrice = Number(req.body.comparePrice) || 0
    if (req.body.stock !== undefined) updateData.stock = Number(req.body.stock) || 0
    if (req.body.category && req.body.category.trim() !== '') {
      updateData.category = req.body.category
    }
    if (req.body.tags !== undefined) {
      updateData.tags = req.body.tags
        ? req.body.tags.split(',').map(t => t.trim()).filter(Boolean)
        : []
    }
    if (req.body.isFeatured !== undefined) {
      updateData.isFeatured = req.body.isFeatured === 'true'
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    res.json(updated)
  } catch (err) {
    console.error('updateProduct error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product)
      return res.status(404).json({ message: 'Product not found' })

    if (!product.vendor.equals(req.vendor._id))
      return res.status(403).json({ message: 'Not your product' })

    // Delete images from Cloudinary
    if (product.imageIds?.length) {
      await Promise.all(product.imageIds.map(id => cloudinary.uploader.destroy(id)))
    }

    await product.deleteOne()
    res.json({ message: 'Product deleted successfully' })
  } catch (err) {
    console.error('deleteProduct error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const addReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body

    if (!rating || !comment)
      return res.status(400).json({ message: 'Rating and comment are required' })

    const product = await Product.findById(req.params.id)
    if (!product)
      return res.status(404).json({ message: 'Product not found' })

    // Check if user already reviewed
    const existing = await Review.findOne({
      product: product._id,
      customer: req.user._id,
    })
    if (existing)
      return res.status(400).json({ message: 'You have already reviewed this product' })

    // Check verified purchase
    const purchased = await Order.findOne({
      customer: req.user._id,
      'items.product': product._id,
      'items.status': 'delivered',
    })

    const review = await Review.create({
      product: product._id,
      customer: req.user._id,
      rating: Number(rating),
      title: title || '',
      comment,
      isVerifiedPurchase: !!purchased,
    })

    res.status(201).json(review)
  } catch (err) {
    console.error('addReview error:', err.message)
    res.status(500).json({ message: err.message })
  }
}

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.rid)
    if (!review)
      return res.status(404).json({ message: 'Review not found' })

    if (!review.customer.equals(req.user._id) && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not allowed' })

    await review.deleteOne()
    res.json({ message: 'Review deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const toggleWishlist = async (req, res) => {
  try {
    const user = req.user
    const pid = req.params.id

    const idx = user.wishlist.findIndex(id => id.toString() === pid)
    if (idx > -1) {
      user.wishlist.splice(idx, 1)
    } else {
      user.wishlist.push(pid)
    }

    await user.save()
    res.json({ wishlist: user.wishlist })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
