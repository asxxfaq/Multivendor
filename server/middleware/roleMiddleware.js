// middleware/roleMiddleware.js
import Vendor from '../models/Vendor.js'

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: admins only' })
  }
  next()
}

export const isVendor = async (req, res, next) => {
  try {
    if (req.user?.role !== 'vendor' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: vendors only' })
    }

    // Admin bypass — admin can do everything
    if (req.user?.role === 'admin') {
      req.vendor = { _id: req.user._id, isApproved: true }
      return next()
    }

    const vendor = await Vendor.findOne({ user: req.user._id })

    if (!vendor) {
      return res.status(404).json({
        message: 'Vendor profile not found. Please complete vendor registration.',
        needsProfile: true,
      })
    }

    if (!vendor.isApproved) {
      return res.status(403).json({
        message: 'Your vendor account is pending approval by admin.',
        needsApproval: true,
      })
    }

    if (!vendor.isActive) {
      return res.status(403).json({
        message: 'Your vendor account has been deactivated. Contact support.',
      })
    }

    req.vendor = vendor
    next()

  } catch (err) {
    res.status(500).json({ message: 'Server error in vendor check' })
  }
}

export const isAdminOrVendor = async (req, res, next) => {
  if (req.user?.role === 'admin') return next()
  if (req.user?.role === 'vendor') return isVendor(req, res, next)
  res.status(403).json({ message: 'Access denied' })
}