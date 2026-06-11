import { useEffect, useState } from 'react'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'
import OrderStatusBadge from '../../components/OrderStatusBadge'

export default function AdminVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [total, setTotal]     = useState(0)
  const [limit]               = useState(10)
  const [search, setSearch]   = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const loadVendors = () => {
    setLoading(true)
    const approvedVal = filter === 'pending' ? 'false' : filter === 'approved' ? 'true' : ''
    const approvedQ = approvedVal ? `&approved=${approvedVal}` : ''
    api.get(`/admin/vendors?page=${page}&limit=${limit}&search=${debouncedSearch}${approvedQ}`)
      .then(r => {
        setVendors(r.data.vendors || [])
        setTotal(r.data.total || 0)
        setPages(r.data.pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [filter])

  useEffect(() => {
    loadVendors()
  }, [page, filter, debouncedSearch])

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/vendors/${id}/approve`)
      setVendors(v => v.map(x => x._id === id ? {...x, isApproved: true} : x))
      toast.success('Vendor approved!')
    } catch { toast.error('Failed') }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:')
    if (!reason) return
    try {
      await api.put(`/admin/vendors/${id}/reject`, { reason })
      setVendors(v => v.filter(x => x._id !== id))
      toast.success('Vendor rejected')
    } catch { toast.error('Failed') }
  }

  if (loading && vendors.length === 0) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Vendors</div>
          <div className="dash-content-subtitle">{total} total vendors</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all','pending','approved'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-dark' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>All Vendors</h3>
          <div className="data-card-tools">
            <div className="search-input-wrap">
              <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Store</th><th>Owner</th><th>Email</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                    {debouncedSearch ? `No vendors match "${debouncedSearch}"` : 'No vendors found'}
                  </td>
                </tr>
              ) : vendors.map(v => (
                <tr key={v._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="vendor-logo">{v.storeName?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{v.storeName}</span>
                    </div>
                  </td>
                  <td>{v.user?.name}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{v.user?.email}</td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{new Date(v.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${v.isApproved ? 'badge-success' : 'badge-warning'}`}>{v.isApproved ? 'Approved' : 'Pending'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {!v.isApproved && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleApprove(v._id)}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(v._id)}>Reject</button>
                        </>
                      )}
                      {v.isApproved && (
                        <button className="btn btn-secondary btn-sm" onClick={() => api.put(`/admin/vendors/${v._id}/toggle`)}>Toggle</button>
                      )}
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
            Showing <strong style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{vendors.length}</strong> of{' '}
            <strong style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{total}</strong> vendors
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </span>

          {pages > 1 && (
            <div className="pagination" style={{ padding: 0, marginTop: 0 }}>
              <button onClick={() => setPage(1)} disabled={page === 1} style={{ width: 34, height: 34 }}>&laquo;&laquo;</button>
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={{ width: 34, height: 34 }}>&laquo;</button>
              {(() => {
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
              })().map(n => (
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