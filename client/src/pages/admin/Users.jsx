import { useEffect, useState } from 'react'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage]       = useState(1)
  const [pages, setPages]     = useState(1)
  const [total, setTotal]     = useState(0)
  const [limit]               = useState(10)

  const loadUsers = () => {
    setLoading(true)
    const roleQ = roleFilter ? `&role=${roleFilter}` : ''
    api.get(`/admin/users?page=${page}&limit=${limit}&search=${debouncedSearch}${roleQ}`)
      .then(r => {
        setUsers(r.data.users || [])
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
  }, [roleFilter])

  useEffect(() => {
    loadUsers()
  }, [page, roleFilter, debouncedSearch])

  const handleToggleActive = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return
    try {
      await api.put(`/admin/users/${id}/toggle`)
      setUsers(u => u.map(x => x._id === id ? {...x, isActive: !currentStatus} : x))
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`)
    } catch { toast.error('Failed') }
  }

  if (loading && users.length === 0) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Users</div>
          <div className="dash-content-subtitle">{total} registered users</div>
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-header">
          <h3>All Users</h3>
          <div className="data-card-tools">
            <select className="form-select" style={{ width: 'auto' }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
            <div className="search-input-wrap">
              <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                    {debouncedSearch ? `No users match "${debouncedSearch}"` : 'No users found'}
                  </td>
                </tr>
              ) : users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray-500)' }}>{u.email}</td>
                  <td><span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'vendor' ? 'badge-info' : 'badge-gray'}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    {u.role !== 'admin' && (
                      <button 
                        className={`btn ${u.isActive ? 'btn-danger' : 'btn-success'} btn-sm`} 
                        onClick={() => handleToggleActive(u._id, u.isActive)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
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
            Showing <strong style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{users.length}</strong> of{' '}
            <strong style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{total}</strong> users
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