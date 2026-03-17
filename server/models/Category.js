import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name:        { type: String, required: true, unique: true, trim: true },
  slug:        { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  imageId:     { type: String, default: '' },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null   // null = top-level category
  },
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 }  // for display ordering
}, { timestamps: true })

export default mongoose.model('Category', categorySchema)