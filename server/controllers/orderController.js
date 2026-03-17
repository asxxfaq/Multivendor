import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Vendor from '../models/Vendor.js'

export const placeOrder = async (req, res) => {
  const { items, shippingAddress, paymentId, razorpayOrderId, paymentMethod = 'razorpay' } = req.body
  let totalAmount = 0
  const orderItems = []

  for (const item of items) {
    const product = await Product.findById(item.productId).populate('vendor')
    if (!product || !product.isActive)
      return res.status(404).json({ message: `Product not found: ${item.productId}` })
    if (product.stock < item.quantity)
      return res.status(400).json({ message: `Insufficient stock for: ${product.name}` })

    product.stock -= item.quantity
    await product.save()

    const lineTotal = product.price * item.quantity
    totalAmount += lineTotal
    orderItems.push({
      product:  product._id,
      vendor:   product.vendor._id,
      name:     product.name,
      image:    product.images[0] || '',
      price:    product.price,
      quantity: item.quantity,
      status:   'pending'
    })
  }

  const platformFee = parseFloat((totalAmount * Number(process.env.COMMISSION_RATE || 0.10)).toFixed(2))

  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
    paymentId:       paymentId || '',
    razorpayOrderId: razorpayOrderId || '',
    totalAmount,
    platformFee
  })

  // Credit vendor earnings
  const vendorMap = {}
  for (const item of orderItems) {
    const vid = item.vendor.toString()
    vendorMap[vid] = (vendorMap[vid] || 0) + item.price * item.quantity
  }
  for (const [vendorId, amount] of Object.entries(vendorMap)) {
    const earning = amount * (1 - Number(process.env.COMMISSION_RATE || 0.10))
    await Vendor.findByIdAndUpdate(vendorId, {
      $inc: { totalEarnings: earning, pendingPayout: earning }
    })
  }

  res.status(201).json(order)
}

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate('items.product', 'name images')
    .populate('items.vendor',  'storeName')
    .sort({ createdAt: -1 })
  res.json(orders)
}

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name images price')
    .populate('items.vendor',  'storeName')
    .populate('customer',      'name email phone')
  if (!order) return res.status(404).json({ message: 'Order not found' })
  const isOwner = order.customer._id.equals(req.user._id)
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin)
    return res.status(403).json({ message: 'Not allowed' })
  res.json(order)
}

export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })
  if (!order.customer.equals(req.user._id))
    return res.status(403).json({ message: 'Not your order' })

  const cancellable = order.items.every(i => ['pending','confirmed'].includes(i.status))
  if (!cancellable)
    return res.status(400).json({ message: 'Order cannot be cancelled at this stage' })

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
    item.status = 'cancelled'
  }
  order.paymentStatus = 'refunded'
  await order.save()
  res.json({ message: 'Order cancelled', order })
}

export const updateItemStatus = async (req, res) => {
  const { orderId, itemId } = req.params
  const { status, trackingNumber } = req.body
  const allowed = ['confirmed','shipped','delivered','cancelled']
  if (!allowed.includes(status))
    return res.status(400).json({ message: 'Invalid status' })

  const order = await Order.findById(orderId)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  const item = order.items.id(itemId)
  if (!item) return res.status(404).json({ message: 'Item not found' })
  if (!item.vendor.equals(req.vendor._id))
    return res.status(403).json({ message: 'Not your order item' })

  item.status = status
  if (trackingNumber) item.trackingNumber = trackingNumber
  await order.save()
  res.json({ message: 'Item status updated', order })
}