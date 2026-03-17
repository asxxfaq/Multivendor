import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../../redux/productSlice'
import ProductCard from '../../components/ProductCard'
import api from '../../utils/axiosInstance'
import '../../styles/customer.css'

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
]

export default function Shop() {
  const dispatch = useDispatch()
  const { list, total, pages, loading } = useSelector((s) => s.products)
  const [params, setParams]       = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [categories, setCategories]   = useState([])
  const [minPrice, setMinPrice]       = useState('')
  const [maxPrice, setMaxPrice]       = useState('')

  const category = params.get('category') || ''
  const sort     = params.get('sort')     || 'newest'
  const page     = Number(params.get('page') || 1)
  const q        = params.get('q')        || ''

  // ── Load categories from API ──────────────
  useEffect(() => {
    api.get('/admin/categories')
      .then(r => setCategories(r.data || []))
      .catch(() => {})
  }, [])

  // ── Fetch products on filter change ───────
  useEffect(() => {
    dispatch(fetchProducts({
      category,
      sort,
      page,
      q,
      minPrice,
      maxPrice,
    }))
  }, [dispatch, category, sort, page, q])

  const setParam = (key, val) => {
    const next = new URLSearchParams(params)
    if (val) next.set(key, val)
    else     next.delete(key)
    next.set('page', '1')
    setParams(next)
  }

  const handleCategoryChange = (slug) => {
    // ✅ send slug — backend handles slug → ObjectId lookup
    setParam('category', category === slug ? '' : slug)
  }

  const handleApplyPrice = () => {
    dispatch(fetchProducts({ category, sort, page, q, minPrice, maxPrice }))
  }

  const handleClearAll = () => {
    setParams({})
    setMinPrice('')
    setMaxPrice('')
  }

  return (
    <div className="container">
      <div className="shop-layout">

        {/* ── Filters Sidebar ── */}
        <aside className={`shop-filters ${filtersOpen ? 'open' : ''}`}>
          <div className="filter-title">
            Filters
            <button
              className="btn btn-ghost btn-sm show-mobile"
              onClick={() => setFiltersOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Category filter */}
          <div className="filter-section">
            <div className="filter-section-title">Category</div>
            {categories.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', padding: '8px 0' }}>
                Loading categories…
              </p>
            ) : (
              categories.map(cat => (
                <label key={cat._id} className="filter-option">
                  <input
                    type="checkbox"
                    // ✅ compare by slug
                    checked={category === cat.slug}
                    onChange={() => handleCategoryChange(cat.slug)}
                  />
                  {cat.name}
                </label>
              ))
            )}
          </div>

          {/* Price filter */}
          <div className="filter-section">
            <div className="filter-section-title">Price Range</div>
            <div className="price-range-inputs">
              <input
                placeholder="Min ₹"
                type="number"
                min={0}
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
              <span>–</span>
              <input
                placeholder="Max ₹"
                type="number"
                min={0}
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary btn-sm btn-full"
              style={{ marginTop: 10 }}
              onClick={handleApplyPrice}
            >
              Apply
            </button>
          </div>

          {/* Sort (mobile) */}
          <div className="filter-section show-mobile">
            <div className="filter-section-title">Sort By</div>
            <select
              className="form-select"
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-ghost btn-sm btn-full"
            onClick={handleClearAll}
          >
            Clear All Filters
          </button>
        </aside>

        {/* ── Main Content ── */}
        <div className="shop-main">

          {/* Toolbar */}
          <div className="shop-toolbar">
            <div className="shop-results">
              {q && (
                <span>
                  Results for <strong>"{q}"</strong> —{' '}
                </span>
              )}
              {category && (
                <span>
                  <strong>
                    {categories.find(c => c.slug === category)?.name || category}
                  </strong>{' '}—{' '}
                </span>
              )}
              <strong>{total}</strong> product{total !== 1 ? 's' : ''} found
            </div>
            <div className="shop-sort">
              <label>Sort:</label>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={sort}
                onChange={e => setParam('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                className="filter-toggle-btn"
                onClick={() => setFiltersOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                Filters
                {category && (
                  <span style={{
                    background:   'var(--maroon, #6B0F1A)',
                    color:        'white',
                    borderRadius: '50%',
                    width:        16,
                    height:       16,
                    fontSize:     '0.625rem',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent: 'center',
                  }}>
                    1
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filters chips */}
          {(category || minPrice || maxPrice || q) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {category && (
                <span style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          6,
                  padding:      '4px 10px',
                  background:   'var(--gold-pale, #F9F3E3)',
                  border:       '1px solid var(--gold-light, #E8C96A)',
                  borderRadius: 'var(--radius-full)',
                  fontSize:     '0.8125rem',
                  color:        'var(--gold-dark, #9A7A2E)',
                  fontWeight:   500,
                }}>
                  {categories.find(c => c.slug === category)?.name || category}
                  <button
                    onClick={() => setParam('category', '')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'inherit', lineHeight: 1, padding: 0 }}
                  >
                    ✕
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span style={{
                  display:      'inline-flex',
                  alignItems:   'center',
                  gap:          6,
                  padding:      '4px 10px',
                  background:   'var(--info-light)',
                  border:       '1px solid var(--info)',
                  borderRadius: 'var(--radius-full)',
                  fontSize:     '0.8125rem',
                  color:        'var(--info)',
                  fontWeight:   500,
                }}>
                  ₹{minPrice || '0'} – ₹{maxPrice || '∞'}
                  <button
                    onClick={() => { setMinPrice(''); setMaxPrice(''); dispatch(fetchProducts({ category, sort, page, q, minPrice: '', maxPrice: '' })) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'inherit', lineHeight: 1, padding: 0 }}
                  >
                    ✕
                  </button>
                </span>
              )}
              <button
                onClick={handleClearAll}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '0.8125rem',
                  color: 'var(--gray-400)', textDecoration: 'underline',
                }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : list.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
              <h4>No products found</h4>
              <p>Try adjusting your filters or search terms</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: 16 }}
                onClick={handleClearAll}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {list.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setParam('page', page - 1)}
              >
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i + 1}
                  className={page === i + 1 ? 'active' : ''}
                  onClick={() => setParam('page', i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page === pages}
                onClick={() => setParam('page', page + 1)}
              >
                ›
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}