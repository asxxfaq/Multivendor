// src/components/ProductCard.jsx
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/cartSlice'
import { toast } from 'react-toastify'
import StarRating from './StarRating'

export default function ProductCard({ product }) {
  const dispatch  = useDispatch()
  const { user }  = useSelector(s => s.auth)

  if (!product) return null

  const {
    _id,
    name,
    images,
    price,
    comparePrice,
    ratings,
    vendor,
    stock,
    isFeatured,
  } = product

  const discount = comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    // ✅ Vendor and admin should not add to cart
    if (user?.role === 'vendor' || user?.role === 'admin') {
      toast.info('Switch to a customer account to shop')
      return
    }

    if (stock === 0) {
      toast.error('This product is out of stock')
      return
    }

    dispatch(addToCart({
      _id,
      name,
      price,
      image:  images?.[0] || '',
      stock,
      vendor: vendor?.storeName || '',
    }))
    toast.success('Added to cart!')
  }

  // ✅ Vendor/admin sees card without cart actions
  const isVendorOrAdmin = user?.role === 'vendor' || user?.role === 'admin'

  return (
    <Link
      to={`/product/${_id}`}
      style={{ textDecoration: 'none', display: 'block', height: '100%' }}
    >
      <div
        style={{
          background:    'var(--white)',
          border:        '1px solid var(--gray-100)',
          overflow:      'hidden',
          display:       'flex',
          flexDirection: 'column',
          height:        '100%',
          transition:    'all 0.35s ease',
          cursor:        'pointer',
          position:      'relative',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow  = '0 12px 32px rgba(15,14,11,0.12)'
          e.currentTarget.style.transform  = 'translateY(-3px)'
          e.currentTarget.style.borderColor = 'var(--gold-light, #E8C96A)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow  = 'none'
          e.currentTarget.style.transform  = 'translateY(0)'
          e.currentTarget.style.borderColor = 'var(--gray-100)'
        }}
      >

        {/* ── Image ── */}
        <div style={{
          position:    'relative',
          aspectRatio: '3/4',
          overflow:    'hidden',
          background:  'var(--ivory-dark, #F5EFE0)',
          flexShrink:  0,
        }}>
          <img
            src={images?.[0] || 'https://placehold.co/300x400/f5efe0/94a3b8?text=No+Image'}
            alt={name}
            loading="lazy"
            style={{
              width:      '100%',
              height:     '100%',
              objectFit:  'cover',
              transition: 'transform 0.6s ease',
              display:    'block',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />

          {/* ── Badges top-left ── */}
          <div style={{
            position:      'absolute',
            top:           10,
            left:          10,
            display:       'flex',
            flexDirection: 'column',
            gap:           5,
            zIndex:        1,
          }}>
            {isFeatured && (
              <span style={{
                background:    'var(--maroon, #6B0F1A)',
                color:         'white',
                fontSize:      '0.5625rem',
                fontWeight:    600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding:       '3px 8px',
                display:       'block',
              }}>
                Featured
              </span>
            )}
            {discount > 0 && (
              <span style={{
                background:    'var(--success)',
                color:         'white',
                fontSize:      '0.5625rem',
                fontWeight:    600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding:       '3px 8px',
                display:       'block',
              }}>
                {discount}% off
              </span>
            )}
            {stock === 0 && (
              <span style={{
                background:    'rgba(15,14,11,0.75)',
                color:         'white',
                fontSize:      '0.5625rem',
                fontWeight:    600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding:       '3px 8px',
                display:       'block',
              }}>
                Sold Out
              </span>
            )}
          </div>

          {/* ── Add to cart — slides up on hover, hidden for vendor/admin ── */}
          {!isVendorOrAdmin && (
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className="product-cart-hover-btn"
              style={{
                position:       'absolute',
                bottom:         0,
                left:           0,
                right:          0,
                background:     stock === 0
                  ? 'rgba(100,116,139,0.85)'
                  : 'var(--maroon, #6B0F1A)',
                color:          'white',
                border:         'none',
                padding:        '11px',
                fontSize:       '0.6875rem',
                fontWeight:     600,
                letterSpacing:  '0.12em',
                textTransform:  'uppercase',
                cursor:         stock === 0 ? 'not-allowed' : 'pointer',
                transform:      'translateY(100%)',
                transition:     'transform 0.3s ease',
                fontFamily:     'var(--font-body)',
                zIndex:         2,
              }}
            >
              {stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{
          padding:       '14px 14px 16px',
          flex:          1,
          display:       'flex',
          flexDirection: 'column',
          gap:           5,
        }}>

          {/* Store name */}
          {vendor?.storeName && (
            <div style={{
              fontSize:      '0.625rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         'var(--gold-dark, #9A7A2E)',
              fontWeight:    500,
              display:       'flex',
              alignItems:    'center',
              gap:           4,
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {vendor.storeName}
            </div>
          )}

          {/* Product name */}
          <h3 style={{
            fontFamily:      'var(--font-display)',
            fontSize:        '0.9375rem',
            fontWeight:      400,
            color:           'var(--charcoal, #1A1A1A)',
            lineHeight:      1.4,
            margin:          0,
            display:         '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:        'hidden',
          }}>
            {name}
          </h3>

          {/* Star rating */}
          {ratings?.count > 0 && (
            <StarRating
              average={ratings.average}
              count={ratings.count}
            />
          )}

          {/* ── Price ── */}
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        8,
            marginTop:  'auto',
            paddingTop: 10,
            borderTop:  '1px solid var(--gray-100)',
            flexWrap:   'wrap',
          }}>

            {/* ✅ Selling price — main */}
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize:   '1.0625rem',
              fontWeight: 500,
              color:      'var(--charcoal, #1A1A1A)',
              lineHeight: 1,
            }}>
              ₹{price?.toLocaleString('en-IN')}
            </span>

            {/* ✅ Original MRP — struck through */}
            {comparePrice > price && (
              <span style={{
                fontSize:       '0.8125rem',
                color:          'var(--gray-400)',
                textDecoration: 'line-through',
                fontWeight:     300,
              }}>
                ₹{comparePrice?.toLocaleString('en-IN')}
              </span>
            )}

          </div>
        </div>

      </div>

      {/* ✅ CSS for cart button hover slide-up */}
      <style>{`
        .product-cart-hover-btn {
          transform: translateY(100%) !important;
        }
        a:hover .product-cart-hover-btn {
          transform: translateY(0) !important;
        }
        a:hover .product-cart-hover-btn:disabled {
          transform: translateY(0) !important;
          cursor: not-allowed !important;
        }
      `}</style>
    </Link>
  )
}