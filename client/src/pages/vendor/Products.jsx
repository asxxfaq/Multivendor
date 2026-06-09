import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [total, setTotal]       = useState(0)
  const [limit]                 = useState(10)
  const [stats, setStats]       = useState({ total: 0, active: 0, hidden: 0, outOfStock: 0 })
  const [error, setError]       = useState('')

  const loadProducts = () => {
    setLoading(true)
    api.get(`/vendor/products?page=${page}&limit=${limit}&search=${debouncedSearch}`)
      .then(r => {
        const data = r.data
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
        if (data.stats) {
          setStats(data.stats)
        }
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load products'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    loadProducts()
  }, [page, limit, debouncedSearch])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted successfully')
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleToggleActive = async (id, current) => {
    try {
      await api.put(`/products/${id}`,
        { isActive: !current },
        { headers: { 'Content-Type': 'application/json' } }
      )
      toast.success(current ? 'Product hidden from shop' : 'Product listed on shop')
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    }
  }

  const renderPaginationRange = () => {
    const range = []
    const maxVisible = 5
    let start = Math.max(1, page - 2)
    let end = Math.min(pages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    for (let i = start; i <= end; i++) {
      if (i >= 1 && i <= pages) range.push(i)
    }
    return range
  }

  // ── Loading ───────────────────────────────────────
  if (loading) return (
    <div style={{
      display:        'flex',
      justifyContent: 'center',
      alignItems:     'center',
      minHeight:      400,
    }}>
      <div className="spinner" />
    </div>
  )

  // ── Error ─────────────────────────────────────────
  if (error) return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      400,
      textAlign:      'center',
      padding:        40,
    }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
      <h3 style={{ color: 'var(--danger)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
        Failed to load products
      </h3>
      <p style={{ color: 'var(--gray-500)', marginBottom: 24, maxWidth: 360 }}>{error}</p>
      <button className="btn btn-primary" onClick={() => loadProducts()}>
        Try Again
      </button>
    </div>
  )

  return (
    <div style={{ padding: '8px 0' }}>

      {/* ── Page Header ── */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        marginBottom:   28,
        gap:            16,
        flexWrap:       'wrap',
      }}>
        <div>
          <h1 style={{
            fontFamily:   'var(--font-display)',
            fontSize:     '1.75rem',
            fontWeight:   400,
            color:        'var(--charcoal, #1A1A1A)',
            marginBottom: 4,
            letterSpacing: '0.02em',
          }}>
            My Products
          </h1>
          <p style={{
            fontSize:   '0.875rem',
            color:      'var(--gray-50)',
            margin:     0,
            fontWeight: 300,
          }}>
            <span style={{ color: 'var(--gray-500)' }}>
              {stats.total} product{stats.total !== 1 ? 's' : ''} in your store
            </span>
          </p>
        </div>
        <Link to="/vendor/add" className="btn btn-primary">
          + Add Product
        </Link>
      </div>

      {/* ── Empty State ── */}
      
      {stats.total === 0 && !loading ? (
        <div style={{
          background:     'var(--white)',
          border:         '1px solid var(--gray-100)',
          borderRadius:   'var(--radius-xl)',
          padding:        '80px 32px',
          textAlign:      'center',
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>📦</div>
          <h3 style={{
            fontFamily:   'var(--font-display)',
            fontSize:     '1.375rem',
            fontWeight:   400,
            color:        'var(--gray-700)',
            marginBottom: 10,
          }}>
            No products yet
          </h3>
          <p style={{
            color:        'var(--gray-400)',
            marginBottom: 28,
            maxWidth:     340,
            fontWeight:   300,
            lineHeight:   1.7,
          }}>
            Start listing your products to reach customers across India
          </p>
          <Link to="/vendor/add" className="btn btn-primary btn-lg">
            + Add Your First Product
          </Link>
        </div>
      ) : (
        <>
          {/* ── Stats Row ── */}
          <div style={{
            display:       'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap:           16,
            marginBottom:  24,
          }}>
            {[
              {
                label: 'Total Products',
                value: stats.total,
                color: 'var(--gold, #C9A84C)',
                bg:    'var(--gold-pale, #F9F3E3)',
                icon:  '📦',
              },
              {
                label: 'Active',
                value: stats.active,
                color: 'var(--success)',
                bg:    'var(--success-light)',
                icon:  '✅',
              },
              {
                label: 'Hidden',
                value: stats.hidden,
                color: 'var(--gray-500)',
                bg:    'var(--gray-100)',
                icon:  '🙈',
              },
              {
                label: 'Out of Stock',
                value: stats.outOfStock,
                color: 'var(--danger)',
                bg:    'var(--danger-light)',
                icon:  '⚠️',
              },
            ].map(stat => (
              <div key={stat.label} style={{
                background:   'var(--white)',
                border:       '1px solid var(--gray-100)',
                borderRadius: 'var(--radius-lg)',
                padding:      '16px 20px',
                display:      'flex',
                alignItems:   'center',
                gap:          14,
              }}>
                <div style={{
                  width:          40,
                  height:         40,
                  borderRadius:   'var(--radius-md)',
                  background:     stat.bg,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '1.125rem',
                  flexShrink:     0,
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize:   '1.375rem',
                    fontWeight: 600,
                    color:      stat.color,
                    lineHeight: 1,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontSize:   '0.75rem',
                    color:      'var(--gray-500)',
                    marginTop:  3,
                    fontWeight: 400,
                  }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Table Card ── */}
          <div style={{
            background:   'var(--white)',
            border:       '1px solid var(--gray-100)',
            borderRadius: 'var(--radius-xl)',
            overflow:     'hidden',
            boxShadow:    'var(--shadow-sm)',
          }}>

            {/* Card Header */}
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '18px 24px',
              borderBottom:   '1px solid var(--gray-100)',
              background:     'var(--ivory, #FDFAF4)',
              gap:            16,
              flexWrap:       'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize:   '1.0625rem',
                  fontWeight: 500,
                  color:      'var(--charcoal, #1A1A1A)',
                  margin:     0,
                }}>
                  Products
                </h3>
                <span style={{
                  fontSize:     '0.75rem',
                  fontWeight:   500,
                  color:        'var(--gray-500)',
                  background:   'var(--gray-100)',
                  padding:      '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  {total}
                </span>
              </div>

              {/* Search */}
              <div style={{ position: 'relative' }}>
                <svg
                  style={{
                    position:  'absolute',
                    left:      10,
                    top:       '50%',
                    transform: 'translateY(-50%)',
                    color:     'var(--gray-400)',
                    width:     14,
                    height:    14,
                    flexShrink: 0,
                  }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  style={{
                    padding:      '8px 12px 8px 32px',
                    border:       '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-md)',
                    fontSize:     '0.8125rem',
                    color:        'var(--charcoal)',
                    width:        220,
                    background:   'var(--white)',
                    outline:      'none',
                    transition:   'all 0.2s',
                    fontFamily:   'var(--font-body)',
                  }}
                  placeholder="Search products…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--gold, #C9A84C)'
                    e.target.style.width = '260px'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--gray-200)'
                    e.target.style.width = '220px'
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{
                width:          '100%',
                borderCollapse: 'collapse',
                fontSize:       '0.875rem',
                whiteSpace:     'nowrap',
              }}>
                <thead>
                  <tr>
                    {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        textAlign:     'left',
                        padding:       '11px 20px',
                        fontSize:      '0.6875rem',
                        fontWeight:    600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color:         'var(--gray-500)',
                        background:    'var(--gray-50)',
                        borderBottom:  '1px solid var(--gray-200)',
                        whiteSpace:    'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{
                        textAlign:  'center',
                        padding:    '48px 20px',
                        color:      'var(--gray-400)',
                        fontStyle:  'italic',
                        fontWeight: 300,
                      }}>
                        {debouncedSearch ? `No products match "${debouncedSearch}"` : 'No products found'}
                      </td>
                    </tr>
                  ) : products.map((p, idx) => (
                    <tr
                      key={p._id}
                      style={{
                        borderBottom: '1px solid var(--gray-100)',
                        background:   idx % 2 === 0 ? 'var(--white)' : 'var(--gray-50, #fafaf9)',
                        transition:   'background 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-faint, #FDF8EE)'}
                      onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--white)' : 'var(--gray-50)'}
                    >

                      {/* Product */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={p.images?.[0] || 'https://placehold.co/48x60/f4f3f0/94a3b8?text=?'}
                            alt={p.name}
                            style={{
                              width:        48,
                              height:       56,
                              objectFit:    'cover',
                              borderRadius: 'var(--radius-md)',
                              flexShrink:   0,
                              border:       '1px solid var(--gray-100)',
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{
                              fontWeight:   500,
                              color:        'var(--charcoal, #1A1A1A)',
                              maxWidth:     200,
                              overflow:     'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace:   'nowrap',
                              fontSize:     '0.875rem',
                              marginBottom: 3,
                            }}>
                              {p.name}
                            </div>
                            {p.comparePrice > p.price && (
                              <div style={{
                                fontSize:   '0.6875rem',
                                color:      'var(--success)',
                                fontWeight: 500,
                                background: 'var(--success-light)',
                                padding:    '1px 6px',
                                display:    'inline-block',
                              }}>
                                {Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}% off
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '14px 20px', color: 'var(--gray-600)', fontWeight: 300 }}>
                        {p.category?.name
                          ? <span style={{
                              padding:    '3px 10px',
                              background: 'var(--gray-100)',
                              fontSize:   '0.75rem',
                              fontWeight: 500,
                              color:      'var(--gray-600)',
                            }}>
                              {p.category.name}
                            </span>
                          : <span style={{ color: 'var(--gray-300)' }}>—</span>
                        }
                      </td>

                      {/* Price */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize:   '1rem',
                          fontWeight: 500,
                          color:      'var(--charcoal)',
                        }}>
                          ₹{p.price?.toLocaleString('en-IN')}
                        </div>
                        {p.comparePrice > p.price && (
                          <div style={{
                            fontSize:       '0.75rem',
                            color:          'var(--gray-400)',
                            textDecoration: 'line-through',
                            fontWeight:     300,
                          }}>
                            ₹{p.comparePrice?.toLocaleString('en-IN')}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display:       'inline-flex',
                          alignItems:    'center',
                          gap:           4,
                          padding:       '3px 10px',
                          fontSize:      '0.75rem',
                          fontWeight:    500,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          background:    p.stock === 0 ? 'var(--danger-light)' :
                                         p.stock < 5  ? 'var(--warning-light)' :
                                         p.stock < 20 ? 'var(--info-light)'    :
                                         'var(--success-light)',
                          color:         p.stock === 0 ? 'var(--danger)'  :
                                         p.stock < 5  ? 'var(--warning)' :
                                         p.stock < 20 ? 'var(--info)'    :
                                         'var(--success)',
                        }}>
                          {p.stock === 0
                            ? '⚠ Out of stock'
                            : `${p.stock} units`
                          }
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display:       'inline-block',
                          padding:       '3px 10px',
                          fontSize:      '0.6875rem',
                          fontWeight:    600,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          background:    p.isActive ? 'var(--success-light)' : 'var(--gray-100)',
                          color:         p.isActive ? 'var(--success)'       : 'var(--gray-500)',
                        }}>
                          {p.isActive ? '● Active' : '○ Hidden'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Link
                            to={`/vendor/edit/${p._id}`}
                            style={{
                              display:       'inline-flex',
                              alignItems:    'center',
                              padding:       '6px 14px',
                              fontSize:      '0.75rem',
                              fontWeight:    500,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color:         'var(--gray-700)',
                              background:    'var(--white)',
                              border:        '1px solid var(--gray-300)',
                              textDecoration: 'none',
                              transition:    'all 0.2s',
                              whiteSpace:    'nowrap',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--gold)'
                              e.currentTarget.style.color = 'var(--gold-dark)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--gray-300)'
                              e.currentTarget.style.color = 'var(--gray-700)'
                            }}
                          >
                            Edit
                          </Link>

                          <button
                            onClick={() => handleToggleActive(p._id, p.isActive)}
                            style={{
                              display:       'inline-flex',
                              alignItems:    'center',
                              padding:       '6px 14px',
                              fontSize:      '0.75rem',
                              fontWeight:    500,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color:         p.isActive ? 'var(--gray-600)' : 'var(--success)',
                              background:    'var(--white)',
                              border:        `1px solid ${p.isActive ? 'var(--gray-300)' : 'var(--success)'}`,
                              cursor:        'pointer',
                              transition:    'all 0.2s',
                              whiteSpace:    'nowrap',
                            }}
                          >
                            {p.isActive ? 'Hide' : 'Show'}
                          </button>

                          <button
                            onClick={() => handleDelete(p._id)}
                            style={{
                              display:       'inline-flex',
                              alignItems:    'center',
                              padding:       '6px 14px',
                              fontSize:      '0.75rem',
                              fontWeight:    500,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color:         'var(--danger)',
                              background:    'var(--white)',
                              border:        '1px solid var(--danger-light)',
                              cursor:        'pointer',
                              transition:    'all 0.2s',
                              whiteSpace:    'nowrap',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'var(--danger)'
                              e.currentTarget.style.color = 'white'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'var(--white)'
                              e.currentTarget.style.color = 'var(--danger)'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '16px 24px',
              borderTop:      '1px solid var(--gray-100)',
              background:     'var(--ivory, #FDFAF4)',
              fontSize:       '0.8125rem',
              color:          'var(--gray-400)',
              fontWeight:     300,
              flexWrap:       'wrap',
              gap:            16,
            }}>
              <span>
                Showing <strong style={{ color: 'var(--gray-600)', fontWeight: 500 }}>{products.length}</strong> of{' '}
                <strong style={{ color: 'var(--gray-600)', fontWeight: 500 }}>{total}</strong> products
                {debouncedSearch && ` matching "${debouncedSearch}"`}
              </span>

              {pages > 1 && (
                <div className="pagination" style={{ padding: 0, marginTop: 0 }}>
                  <button onClick={() => setPage(1)} disabled={page === 1} style={{ width: 34, height: 34 }}>&laquo;&laquo;</button>
                  <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={{ width: 34, height: 34 }}>&laquo;</button>
                  {renderPaginationRange().map(n => (
                    <button key={n} onClick={() => setPage(n)} className={page === n ? 'active' : ''} style={{ width: 34, height: 34 }}>{n}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(p + 1, pages))} disabled={page === pages} style={{ width: 34, height: 34 }}>&raquo;</button>
                  <button onClick={() => setPage(pages)} disabled={page === pages} style={{ width: 34, height: 34 }}>&raquo;&raquo;</button>
                </div>
              )}

              {debouncedSearch && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    background:  'none',
                    border:      'none',
                    cursor:      'pointer',
                    color:       'var(--gold-dark, #9A7A2E)',
                    fontSize:    '0.8125rem',
                    fontWeight:  500,
                    textDecoration: 'underline',
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}