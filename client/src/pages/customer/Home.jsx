// src/pages/customer/Home.jsx
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFeatured } from '../../redux/productSlice'
import ProductCard from '../../components/ProductCard'
import { toast } from 'react-toastify'
import api from '../../utils/axiosInstance'
import '../../styles/customer.css'

export default function Home() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { featured, loading } = useSelector(s => s.products)
  const { user } = useSelector(s => s.auth)
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState('')

  useEffect(() => {
    dispatch(fetchFeatured())
    api.get('/admin/categories')
      .then(r => setCategories(r.data || []))
      .catch(() => {})
  }, [dispatch])

  const handleCategoryClick = (slug) => {
    setActiveCategory(slug)
  }

  const handleStartSelling = (e) => {
    if (user) {
      e.preventDefault()
      return toast.info('You are logged in as a Customer. Please logout first to register a Vendor account.')
    }
    navigate('/register', { state: { role: 'vendor' } })
  }

  const handleVendorLogin = (e) => {
    if (user) {
      e.preventDefault()
      return toast.info('You are already logged in.')
    }
    navigate('/login')
  }

  const displayedFeatured = featured.filter(p => !activeCategory || p.category?.slug === activeCategory)

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <span className="hero-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Trusted by 50,000+ Customers
              </span>
              <h1>
                Shop the Finest <span>Men's</span> Fashion
              </h1>
              <p>
                Discover premium clothing from verified vendors across India.
                Shirts, trousers, ethnic wear and more — all in one marketplace.
              </p>
              <div className="hero-actions">
                <Link to="/shop" className="btn btn-primary btn-lg">Shop Now</Link>
                <Link to="/shop?sort=newest" className="btn btn-secondary btn-lg">New Arrivals</Link>
              </div>
              <div className="hero-stats">
                <div>
                  <div className="hero-stat-value">500+</div>
                  <div className="hero-stat-label">Vendors</div>
                </div>
                <div>
                  <div className="hero-stat-value">10K+</div>
                  <div className="hero-stat-label">Products</div>
                </div>
                <div>
                  <div className="hero-stat-value">4.8★</div>
                  <div className="hero-stat-label">Avg Rating</div>
                </div>
              </div>
            </div>

            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80"
                alt="Men's Fashion"
              />
              <div className="hero-image-badge">🔥 50% off on first order</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories Bar ── */}
      <div className="categories-bar">
        <div className="container">
          <div className="categories-bar-inner">
            <button
              className={`category-pill ${activeCategory === '' ? 'active' : ''}`}
              onClick={() => handleCategoryClick('')}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                className={`category-pill ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Products ── */}
      <section className="products-section">
        <div className="container">
          <div className="products-header">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/shop" className="btn btn-secondary btn-sm">View All →</Link>
          </div>

          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : displayedFeatured.length > 0 ? (
            <div className="products-grid">
              {displayedFeatured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📦</span>
              <h4>{activeCategory ? 'No featured products in this category' : 'No featured products yet'}</h4>
              <p>Check back soon or explore the full shop</p>
              <Link to="/shop" className="btn btn-primary">Browse All Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Category Quick Links ── */}
      {categories.length > 0 && (
        <section style={{ padding: '0 0 64px' }}>
          <div className="container">
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <p style={{
                fontSize:      '0.75rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color:         'var(--gold-dark, #9A7A2E)',
                fontWeight:    600,
                marginBottom:  8,
              }}>
                Browse by Category
              </p>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize:   'clamp(1.5rem, 3vw, 2rem)',
                fontWeight: 400,
                color:      'var(--charcoal, #1A1A1A)',
                margin:     0,
              }}>
                Shop by Category
              </h2>
            </div>

            <div style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap:                 16,
            }}>
              {categories.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => navigate(`/shop?category=${cat.slug}`)}
                  style={{
                    background:    'var(--white)',
                    border:        '1px solid var(--gray-100)',
                    padding:       '24px 16px',
                    textAlign:     'center',
                    cursor:        'pointer',
                    transition:    'all 0.25s ease',
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    gap:           10,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--gold, #C9A84C)'
                    e.currentTarget.style.background  = 'var(--gold-faint, #FDF8EE)'
                    e.currentTarget.style.transform   = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow   = '0 4px 16px rgba(201,168,76,0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--gray-100)'
                    e.currentTarget.style.background  = 'var(--white)'
                    e.currentTarget.style.transform   = 'translateY(0)'
                    e.currentTarget.style.boxShadow   = 'none'
                  }}
                >
                  <span style={{ fontSize: '1.75rem' }}>
                    {cat.slug === 'shirts'     ? '👔' :
                     cat.slug === 'trousers'   ? '👖' :
                     cat.slug === 'jackets'    ? '🧥' :
                     cat.slug === 'ethnic'     ? '🕌' :
                     cat.slug === 'formals'    ? '💼' :
                     cat.slug === 'casual'     ? '👕' :
                     cat.slug === 'sports'     ? '🏃' :
                     cat.slug === 'winterwear' ? '🧤' : '🛍️'}
                  </span>
                  <span style={{
                    fontSize:      '0.8125rem',
                    fontWeight:    500,
                    color:         'var(--gray-700)',
                    letterSpacing: '0.04em',
                  }}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Promo Banner ── */}
      <section style={{ padding: '0 0 64px' }}>
        <div className="container">
          <div style={{
            background:    'var(--charcoal, #1A1A1A)',
            padding:       '56px 64px',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'space-between',
            flexWrap:      'wrap',
            gap:           32,
            position:      'relative',
            overflow:      'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', border: '60px solid rgba(201,168,76,0.08)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -40, left: '40%', width: 200, height: 200, borderRadius: '50%', border: '50px solid rgba(201,168,76,0.05)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
              <p style={{ fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold, #C9A84C)', fontWeight: 600, marginBottom: 12 }}>
                For Vendors
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--white)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, marginBottom: 12, lineHeight: 1.3 }}>
                Start Selling on MultiShop Today
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9375rem', lineHeight: 1.75, fontWeight: 300, margin: 0 }}>
                Join 500+ vendors selling on MultiShop. Set up your store in minutes,
                list unlimited products, and reach customers across India.
              </p>
              <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
                {['Free to join', 'Low commission', 'Fast payouts'].map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: 'var(--gold, #C9A84C)', fontSize: '0.875rem' }}>✓</span>
                    <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)', fontWeight: 300 }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              {/* ✅ Fixed redirect */}
              <button
                onClick={handleStartSelling}
                style={{
                  display:       'inline-flex',
                  alignItems:    'center',
                  gap:           8,
                  padding:       '14px 28px',
                  background:    'var(--gold, #C9A84C)',
                  color:         'var(--charcoal, #1A1A1A)',
                  border:        'none',
                  fontSize:      '0.8125rem',
                  fontWeight:    600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor:        'pointer',
                  transition:    'all 0.2s',
                  fontFamily:    'var(--font-body)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#E8C96A'
                  e.currentTarget.style.transform  = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow  = '0 4px 20px rgba(201,168,76,0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--gold, #C9A84C)'
                  e.currentTarget.style.transform  = 'translateY(0)'
                  e.currentTarget.style.boxShadow  = 'none'
                }}
              >
                🏪 Start Selling
              </button>

              <Link
                to="/login"
                onClick={handleVendorLogin}
                style={{
                  display:        'inline-flex',
                  alignItems:     'center',
                  gap:            8,
                  padding:        '14px 28px',
                  background:     'transparent',
                  color:          'rgba(255,255,255,0.7)',
                  border:         '1px solid rgba(255,255,255,0.2)',
                  fontSize:       '0.8125rem',
                  fontWeight:     500,
                  letterSpacing:  '0.1em',
                  textTransform:  'uppercase',
                  cursor:         'pointer',
                  transition:     'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                  e.currentTarget.style.color       = 'white'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  e.currentTarget.style.color       = 'rgba(255,255,255,0.7)'
                }}
              >
                Already a Vendor? Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}