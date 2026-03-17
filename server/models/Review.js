import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, trim: true },
  comment: { type: String, required: true, trim: true },
  images:  [{ type: String }],
  imageIds:[{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 }
}, { timestamps: true })

// One review per customer per product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true })

// After save/delete — recalculate product's average rating
reviewSchema.post('save', async function () {
  const Review = this.constructor
  const Product = mongoose.model('Product')
  const stats = await Review.aggregate([
    { $match: { product: this.product } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ])
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': Math.round(stats[0].avg * 10) / 10,
      'ratings.count':   stats[0].count
    })
  }
})

export default mongoose.model('Review', reviewSchema)