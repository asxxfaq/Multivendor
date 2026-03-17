import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProduct } from '../../redux/productSlice'
import { addToCart } from '../../redux/cartSlice'
import { toast } from 'react-toastify'
import StarRating from '../../components/StarRating'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import api from '../../utils/axiosInstance'
import '../../styles/customer.css'

export default function ProductDetail() {
  const { id }  = useParams()
  const dispatch = useDispatch()
  const { current: product, loading } = useSelector((s) => s.products)
  const [mainImg, setMainImg]   = useState(0)
  const [qty, setQty]           = useState(1)
  const [selectedSize, setSize] = useState('')
  const [activeTab, setTab]     = useState('description')
  const [reviews, setReviews]   = useState([])
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' })

  useEffect(() => {
    dispatch(fetchProduct(id))
    api.get(`/products/${id}/reviews`).then(r => setReviews(r.data)).catch(() => {})
  }, [dispatch, id])

  if (loading || !product) return <div className="spinner-wrap"><div className="spinner" /></div>

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0

  const handleAddToCart = () => {
    dispatch(addToCart({
      _id: product._id, name: product.name,
      price: product.price, image: product.images?.[0],
      stock: product.stock, selectedSize, quantity: qty
    }))
    toast.success('Added to cart!')
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/products/${id}/reviews`, newReview)
      toast.success('Review submitted!')
      const r = await api.get(`/products/${id}/reviews`)
      setReviews(r.data)
      setNewReview({ rating: 5, title: '', comment: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    }
  }

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div style={{ padding: '16px 0', fontSize: '0.875rem', color: 'var(--gray-500)', display: 'flex', gap: 8 }}>
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / <span style={{ color: 'var(--gray-800)' }}>{product.name}</span>
      </div>

      <div className="product-detail-layout">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img src={product.images?.[mainImg] || 'https://placehold.co/600x600/f1f5f9/94a3b8?text=No+Image'} alt={product.name} />
          </div>
          {product.images?.length > 1 && (
            <div className="product-gallery-thumbs">
              {product.images.map((img, i) => (
                <div key={i} className={`gallery-thumb ${mainImg === i ? 'active' : ''}`} onClick={() => setMainImg(i)}>
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="product-info">
          <Link to={`/shop?vendor=${product.vendor?._id}`} className="product-info-vendor">
            🏪 {product.vendor?.storeName}
          </Link>
          <h1 className="product-info-title">{product.name}</h1>
          <div className="product-info-rating">
            <StarRating average={product.ratings?.average} count={product.ratings?.count} />
            {product.stock === 0
              ? <span className="badge badge-danger">Out of stock</span>
              : <span className="badge badge-success">In stock ({product.stock})</span>
            }
          </div>
          <div className="product-info-price">
            <span className="price-current">₹{product.price?.toLocaleString()}</span>
            {product.comparePrice > product.price && (
              <>
                <span className="price-original">₹{product.comparePrice?.toLocaleString()}</span>
                <span className="price-discount">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Sizes */}
          {[...new Set((product.variants || []).map(v => v.size).filter(Boolean))].length > 0 && (
            <div className="variant-section">
              <div className="variant-label">Size: <span>{selectedSize || 'Select size'}</span></div>
              <div className="variants-row">
                {[...new Set(product.variants.map(v => v.size).filter(Boolean))].map(s => (
                  <button key={s} className={`variant-btn ${selectedSize === s ? 'active' : ''}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div className="variant-section">
            <div className="variant-label">Quantity:</div>
            <div className="qty-selector">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <input className="qty-value" value={qty} readOnly />
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>

          <div className="product-actions-row">
            <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0}>
              🛒 {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button className="btn btn-dark btn-lg">⚡ Buy Now</button>
          </div>

          <div className="product-meta">
            <div className="product-meta-item">🚚 Free delivery on orders above ₹499</div>
            <div className="product-meta-item">↩️ 7-day easy returns</div>
            <div className="product-meta-item">✅ Verified vendor product</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="product-tabs">
        <div className="tabs-header">
          {['description','reviews'].map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)} {t === 'reviews' && `(${reviews.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div style={{ maxWidth: 720 }}>
            <p style={{ lineHeight: 1.8, color: 'var(--gray-700)' }}>{product.description || 'No description provided.'}</p>
            {product.tags?.length > 0 && (
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.tags.map(t => <span key={t} className="badge badge-gray">#{t}</span>)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ maxWidth: 720 }}>
            {/* Add review form */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header"><h3>Write a Review</h3></div>
              <div className="card-body">
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label className="form-label">Rating</label>
                    <select className="form-select" value={newReview.rating}
                      onChange={e => setNewReview(r => ({...r, rating: Number(e.target.value)}))}>
                      {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)} {n} star{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title (optional)</label>
                    <input className="form-input" placeholder="Great product!"
                      value={newReview.title} onChange={e => setNewReview(r => ({...r, title: e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Review</label>
                    <textarea className="form-textarea" placeholder="Share your experience…" required
                      value={newReview.comment} onChange={e => setNewReview(r => ({...r, comment: e.target.value}))} />
                  </div>
                  <button className="btn btn-primary" type="submit">Submit Review</button>
                </form>
              </div>
            </div>

            {/* Reviews list */}
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div className="empty-state"><h4>No reviews yet</h4><p>Be the first to review!</p></div>
              ) : reviews.map(r => (
                <div key={r._id} className="review-item">
                  <div className="review-header">
                    <div className="reviewer">
                      <div className="reviewer-avatar">{r.customer?.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div className="reviewer-name">{r.customer?.name}</div>
                        <div className="reviewer-date">{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>
                    <StarRating average={r.rating} count={0} />
                  </div>
                  {r.title && <h5 style={{ marginBottom: 6, color: 'var(--gray-800)' }}>{r.title}</h5>}
                  <p className="review-text">{r.comment}</p>
                  {r.isVerifiedPurchase && (
                    <span className="badge badge-success" style={{ marginTop: 8 }}>✓ Verified Purchase</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}