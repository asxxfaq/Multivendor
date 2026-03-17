import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/axiosInstance'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import '../../styles/customer.css'

const FILTERS = ['All','Pending','Confirmed','Shipped','Delivered','Cancelled']

export default function Orders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('All')

  useEffect(() => {
    api.get('/orders/my')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? orders
    : orders.filter(o => o.items.some(i => i.status.toLowerCase() === filter.toLowerCase()))

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <div className="container" style={{ padding: '32px 24px 64px' }}>
      <h1 className="page-title">My Orders</h1>

      <div className="orders-filters">
        {FILTERS.map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-dark' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h4>No orders found</h4>
          <p style={{ marginBottom: 20 }}>{filter === 'All' ? "You haven't placed any orders yet." : `No ${filter.toLowerCase()} orders.`}</p>
          <Link to="/shop" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {filtered.map(order => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-id">Order <span>#{order._id.slice(-8).toUpperCase()}</span></div>
                  <div className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <OrderStatusBadge status={order.paymentStatus} />
              </div>
              <div className="order-items-preview">
                {order.items.slice(0, 3).map(item => (
                  <div key={item._id} className="order-product-thumb">
                    <img src={item.image || 'https://placehold.co/52x52/f1f5f9/94a3b8?text=+'} alt={item.name} />
                    <div className="order-product-info">
                      <div className="order-product-name">{item.name}</div>
                      <div className="order-product-qty">Qty: {item.quantity} · <span><OrderStatusBadge status={item.status} /></span></div>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--gray-500)', fontSize: '0.875rem', flexShrink: 0 }}>
                    +{order.items.length - 3} more
                  </div>
                )}
              </div>
              <div className="order-card-footer">
                <div className="order-total">₹{order.totalAmount?.toLocaleString()}</div>
                <div className="order-actions">
                  <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">View Details</Link>
                  {order.items.every(i => ['pending','confirmed'].includes(i.status)) && (
                    <button className="btn btn-danger btn-sm">Cancel</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}