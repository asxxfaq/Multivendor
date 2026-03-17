import { useEffect, useState } from 'react'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'
import OrderStatusBadge from '../../components/OrderStatusBadge'

export default function AdminVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    const q = filter === 'pending' ? '?approved=false' : filter === 'approved' ? '?approved=true' : ''
    api.get(`/admin/vendors${q}`).then(r => setVendors(r.data.vendors || [])).finally(() => setLoading(false))
  }, [filter])

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

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Vendors</div>
          <div className="dash-content-subtitle">{vendors.length} total vendors</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all','pending','approved'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-dark' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="data-card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Store</th><th>Owner</th><th>Email</th><th>Applied</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No vendors found</td></tr>
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
      </div>
    </>
  )
}