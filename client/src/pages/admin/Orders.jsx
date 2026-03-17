import { useEffect, useState } from 'react'
import api from '../../utils/axiosInstance'
import OrderStatusBadge from '../../components/OrderStatusBadge'

export default function AdminOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')

  useEffect(() => {
    const q = filter ? `?paymentStatus=${filter}` : ''
    api.get(`/admin/orders${q}`).then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false))
  }, [filter])

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">All Orders</div>
          <div className="dash-content-subtitle">{orders.length} orders on the platform</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['','pending','paid','refunded'].map(f => (
            <button key={f} className={`btn ${filter === f ? 'btn-dark' : 'btn-secondary'} btn-sm`}
              onClick={() => setFilter(f)}>{f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}</button>
          ))}
        </div>
      </div>

      <div className="data-card">
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Platform Fee</th><th>Payment</th><th>Date</th></tr></thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 600 }}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{o.customer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{o.customer?.email}</div>
                  </td>
                  <td>{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                  <td style={{ fontWeight: 700 }}>₹{o.totalAmount?.toLocaleString()}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{o.platformFee?.toLocaleString()}</td>
                  <td><OrderStatusBadge status={o.paymentStatus} /></td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}