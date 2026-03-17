import { useEffect, useState } from 'react'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  useEffect(() => {
    const q = roleFilter ? `?role=${roleFilter}` : ''
    api.get(`/admin/users${q}`).then(r => setUsers(r.data.users || [])).finally(() => setLoading(false))
  }, [roleFilter])

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this user?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(u => u.map(x => x._id === id ? {...x, isActive: false} : x))
      toast.success('User deactivated')
    } catch { toast.error('Failed') }
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Users</div>
          <div className="dash-content-subtitle">{users.length} registered users</div>
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
              {filtered.map(u => (
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
                    {u.role !== 'admin' && u.isActive && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u._id)}>Deactivate</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}