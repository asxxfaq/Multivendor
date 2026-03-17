import { useEffect, useState } from 'react'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

const STATUS_OPTIONS = ['confirmed', 'shipped', 'delivered', 'cancelled']

const STATUS_STYLES = {
  pending:   { bg: 'var(--warning-light)', color: 'var(--warning)',  label: 'Pending'   },
  confirmed: { bg: 'var(--info-light)',    color: 'var(--info)',     label: 'Confirmed' },
  shipped:   { bg: '#ede9fe',              color: '#7c3aed',         label: 'Shipped'   },
  delivered: { bg: 'var(--success-light)', color: 'var(--success)',  label: 'Delivered' },
  cancelled: { bg: 'var(--danger-light)',  color: 'var(--danger)',   label: 'Cancelled' },
}

function Badge({ status }) {
  const s = STATUS_STYLES[status?.toLowerCase()] || STATUS_STYLES.pending
  return (
    <span style={{
      display:       'inline-block',
      padding:       '3px 10px',
      fontSize:      '0.6875rem',
      fontWeight:    600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background:    s.bg,
      color:         s.color,
      whiteSpace:    'nowrap',
    }}>
      {s.label}
    </span>
  )
}

export default function VendorOrders() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    api.get('/vendor/orders')
      .then(r => {
        const data = r.data
        // ✅ Handle both plain array and { orders: [] } object
        if (Array.isArray(data))             setOrders(data)
        else if (Array.isArray(data.orders)) setOrders(data.orders)
        else                                 setOrders([])
      })
      .catch(() => {
        toast.error('Failed to load orders')
        setOrders([])
      })
      .finally(() => setLoading(false))
  }, [])

  const handleStatusUpdate = async (orderId, itemId, status) => {
    setUpdating(itemId)
    try {
      await api.put(`/orders/${orderId}/items/${itemId}/status`, { status })
      setOrders(prev => prev.map(o => ({
        ...o,
        items: o.items.map(i => i._id === itemId ? { ...i, status } : i),
      })))
      toast.success(`Status updated to ${status}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  // ✅ Safe flatMap — orders is guaranteed to be an array
  const rows = orders.flatMap(order =>
    (order.items || []).map(item => ({ order, item }))
  )

  if (loading) return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', minHeight: 400,
    }}>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--gray-200)',
        borderTopColor: 'var(--gold, #C9A84C)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ padding: '8px 0' }}>

      {/* ── Header ── */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        marginBottom:   28,
        flexWrap:       'wrap',
        gap:            16,
      }}>
        <div>
          <h1 style={{
            fontFamily:    'var(--font-display)',
            fontSize:      '1.75rem',
            fontWeight:    400,
            color:         'var(--charcoal, #1A1A1A)',
            marginBottom:  4,
            letterSpacing: '0.02em',
          }}>
            Orders
          </h1>
          <p style={{
            fontSize: '0.875rem', color: 'var(--gray-500)',
            margin: 0, fontWeight: 300,
          }}>
            {rows.length} item{rows.length !== 1 ? 's' : ''} across {orders.length} order{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      {orders.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          {[
            { label: 'Total Orders', value: orders.length,                                                          color: 'var(--gold, #C9A84C)',    bg: 'var(--gold-pale, #F9F3E3)'  },
            { label: 'Pending',      value: rows.filter(r => r.item.status === 'pending').length,                   color: 'var(--warning)',           bg: 'var(--warning-light)'       },
            { label: 'Shipped',      value: rows.filter(r => r.item.status === 'shipped').length,                   color: '#7c3aed',                  bg: '#ede9fe'                    },
            { label: 'Delivered',    value: rows.filter(r => r.item.status === 'delivered').length,                 color: 'var(--success)',           bg: 'var(--success-light)'       },
          ].map(s => (
            <div key={s.label} style={{
              background:   'var(--white)',
              border:       '1px solid var(--gray-100)',
              borderRadius: 'var(--radius-lg)',
              padding:      '16px 20px',
              display:      'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 38, height: 38,
                background: s.bg,
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: s.color }}>
                  {s.value}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div style={{
        background:   'var(--white)',
        border:       '1px solid var(--gray-100)',
        borderRadius: 'var(--radius-xl)',
        overflow:     'hidden',
        boxShadow:    'var(--shadow-sm)',
      }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: '0.875rem', whiteSpace: 'nowrap',
          }}>
            <thead>
              <tr>
                {['Order ID', 'Customer', 'Product', 'Qty', 'Amount', 'Status', 'Update Status'].map(h => (
                  <th key={h} style={{
                    textAlign:     'left',
                    padding:       '11px 20px',
                    fontSize:      '0.6875rem',
                    fontWeight:    600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color:         'var(--gray-500)',
                    background:    'var(--ivory, #FDFAF4)',
                    borderBottom:  '1px solid var(--gray-200)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    textAlign: 'center', padding: '60px 20px',
                    color: 'var(--gray-400)', fontStyle: 'italic', fontWeight: 300,
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: 10 }}>📋</div>
                    No orders yet
                  </td>
                </tr>
              ) : rows.map(({ order, item }, idx) => (
                <tr
                  key={`${order._id}-${item._id}`}
                  style={{
                    borderBottom: '1px solid var(--gray-100)',
                    background:   idx % 2 === 0 ? 'var(--white)' : 'var(--gray-50, #fafaf9)',
                    transition:   'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-faint, #FDF8EE)'}
                  onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--white)' : 'var(--gray-50)'}
                >
                  {/* Order ID */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize:   '0.8125rem',
                      fontWeight: 700,
                      color:      'var(--charcoal)',
                    }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--gray-400)', fontWeight: 300, marginTop: 2 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </td>

                  {/* Customer */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--charcoal)' }}>
                      {order.customer?.name || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 300, marginTop: 2 }}>
                      {order.customer?.email || ''}
                    </div>
                  </td>

                  {/* Product */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={item.image || 'https://placehold.co/44x54/f5efe0/94a3b8?text=?'}
                        alt={item.name}
                        style={{
                          width: 44, height: 54,
                          objectFit: 'cover', flexShrink: 0,
                          border: '1px solid var(--gray-100)',
                          background: 'var(--ivory-dark)',
                        }}
                      />
                      <span style={{
                        maxWidth:     160,
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace:   'nowrap',
                        fontSize:     '0.875rem',
                        fontWeight:   400,
                        color:        'var(--charcoal)',
                        fontFamily:   'var(--font-display)',
                      }}>
                        {item.name}
                      </span>
                    </div>
                  </td>

                  {/* Qty */}
                  <td style={{ padding: '14px 20px', color: 'var(--gray-600)', fontWeight: 300 }}>
                    {item.quantity}
                  </td>

                  {/* Amount */}
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize:   '0.9375rem',
                      fontWeight: 500,
                      color:      'var(--charcoal)',
                    }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--gray-400)', fontWeight: 300, marginTop: 2 }}>
                      ₹{item.price?.toLocaleString('en-IN')} each
                    </div>
                  </td>

                  {/* Status badge */}
                  <td style={{ padding: '14px 20px' }}>
                    <Badge status={item.status} />
                  </td>

                  {/* Update status */}
                  <td style={{ padding: '14px 20px' }}>
                    <select
                      value={item.status}
                      disabled={
                        updating === item._id ||
                        item.status === 'cancelled' ||
                        item.status === 'delivered'
                      }
                      onChange={e => handleStatusUpdate(order._id, item._id, e.target.value)}
                      style={{
                        padding:      '6px 28px 6px 10px',
                        fontSize:     '0.75rem',
                        fontWeight:   500,
                        letterSpacing: '0.04em',
                        border:       '1px solid var(--gray-200)',
                        background:   updating === item._id
                          ? 'var(--gray-100)'
                          : item.status === 'cancelled' || item.status === 'delivered'
                          ? 'var(--gray-100)'
                          : 'var(--white)',
                        color:        'var(--charcoal)',
                        cursor:       updating === item._id ||
                          item.status === 'cancelled' ||
                          item.status === 'delivered'
                          ? 'not-allowed' : 'pointer',
                        appearance:   'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat:   'no-repeat',
                        backgroundPosition: 'right 8px center',
                        minWidth: 130,
                        transition: 'border-color 0.2s',
                      }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    {(item.status === 'cancelled' || item.status === 'delivered') && (
                      <div style={{ fontSize: '0.6875rem', color: 'var(--gray-400)', marginTop: 4 }}>
                        Cannot update
                      </div>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {rows.length > 0 && (
          <div style={{
            padding:    '12px 24px',
            borderTop:  '1px solid var(--gray-100)',
            background: 'var(--ivory, #FDFAF4)',
            fontSize:   '0.8125rem',
            color:      'var(--gray-400)',
            fontWeight: 300,
          }}>
            Showing {rows.length} item{rows.length !== 1 ? 's' : ''} from {orders.length} order{orders.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

    </div>
  )
}