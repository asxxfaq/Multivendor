// models/Product.js
import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema({
  size:  { type: String },
  color: { type: String },
  stock: { type: Number, default: 0 },
  price: { type: Number }
})

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  name:         { type: String, required: true, trim: true },
  description:  { type: String, required: true },
  price:        { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  images:       [{ type: String }],
  imageIds:     [{ type: String }],

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags:     [{ type: String }],
  stock:    { type: Number, default: 0, min: 0 },
  variants: [variantSchema],

  ratings: {
    average: { type: Number, default: 0 },
    count:   { type: Number, default: 0 }
  },

  isActive:   { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

}, { timestamps: true })

// Full-text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text' })

export default mongoose.model('Product', productSchema)