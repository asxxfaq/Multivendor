import { useEffect, useState } from 'react'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [total, setTotal]       = useState(0)
  const [limit]                 = useState(10)
  const [stats, setStats]       = useState({ totalCount: 0, active: 0, hidden: 0, outOfStock: 0 })
  const [error, setError]       = useState('')

  const loadProducts = () => {
    setLoading(true)
    api.get(`/admin/products?page=${page}&limit=${limit}&search=${debouncedSearch}`)
      .then(r => {
        const data = r.data
        setProducts(data.products || [])
        setTotal(data.total || 0)
        setPages(data.pages || 1)
        setStats({
          totalCount: data.totalCount || 0,
          active: data.active || 0,
          hidden: data.hidden || 0,
          outOfStock: data.outOfStock || 0
        })
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
    if (!window.confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deleted successfully')
      loadProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const handleToggleActive = async (id, current) => {
    try {
      await api.put(`/admin/products/${id}/toggle`)
      toast.success(current ? 'Product deactivated' : 'Product activated')
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

  if (loading && products.length === 0) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      {/* ── Page Header ── */}
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Manage Products</div>
          <div className="dash-content-subtitle">
            {stats.totalCount} products currently in catalog
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{
        display:       'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap:           16,
        marginBottom:  24,
      }}>
        {[
          { label: 'Total Products', value: stats.totalCount, color: 'var(--gold, #C9A84C)', bg: 'var(--gold-pale, #F9F3E3)', icon: '📦' },
          { label: 'Active on Shop', value: stats.active, color: 'var(--success)', bg: 'var(--success-light)', icon: '✅' },
          { label: 'Deactivated', value: stats.hidden, color: 'var(--gray-500)', bg: 'var(--gray-100)', icon: '🙈' },
          { label: 'Out of Stock', value: stats.outOfStock, color: 'var(--danger)', bg: 'var(--danger-light)', icon: '⚠️' }
        ].map(s => (
          <div key={s.label} style={{
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
              background:     s.bg,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '1.125rem',
              flexShrink:     0,
            }}>
              {s.icon}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize:   '1.375rem',
                fontWeight: 600,
                color:      s.color,
                lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize:   '0.75rem',
                color:      'var(--gray-500)',
                marginTop:  3,
                fontWeight: 400,
              }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table Card ── */}
      <div className="data-card">
        <div className="data-card-header">
          <h3>All Products</h3>
          <div className="data-card-tools">
            <div className="search-input-wrap">
              <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                placeholder="Search products…" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                    {debouncedSearch ? `No products match "${debouncedSearch}"` : 'No products in database'}
                  </td>
                </tr>
              ) : products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={p.images?.[0] || 'https://placehold.co/48x60/f4f3f0/94a3b8?text=?'} 
                        alt={p.name} 
                        style={{
                          width: 40,
                          height: 48,
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--gray-100)',
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontWeight: 500, display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.category?.name ? (
                      <span className="badge badge-gray">{p.category.name}</span>
                    ) : (
                      <span style={{ color: 'var(--gray-300)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.95rem' }}>
                      ₹{p.price?.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      p.stock === 0 ? 'badge-danger' :
                      p.stock < 5  ? 'badge-warning' :
                      'badge-success'
                    }`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--maroon)' }}>
                      {p.vendor?.storeName || 'Unknown Store'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.isActive ? 'badge-success' : 'badge-gray'}`}>
                      {p.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a 
                        href={`/product/${p._id}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn btn-secondary btn-sm"
                        style={{ textTransform: 'uppercase', padding: '4px 10px', fontSize: '0.6875rem' }}
                      >
                        View
                      </a>
                      <button 
                        className={`btn btn-sm ${p.isActive ? 'btn-outline' : 'btn-primary'}`}
                        style={{ padding: '4px 10px', fontSize: '0.6875rem' }}
                        onClick={() => handleToggleActive(p._id, p.isActive)}
                      >
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 10px', fontSize: '0.6875rem' }}
                        onClick={() => handleDelete(p._id)}
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

        {/* Footer with pagination */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '16px 24px',
          borderTop:      '1px solid var(--gray-100)',
          background:     'var(--ivory, #FDFAF4)',
          fontSize:       '0.8125rem',
          color:          'var(--gray-500)',
          fontWeight:     300,
          flexWrap:       'wrap',
          gap:            16,
        }}>
          <span>
            Showing <strong style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{products.length}</strong> of{' '}
            <strong style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{total}</strong> products
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
  )
}
