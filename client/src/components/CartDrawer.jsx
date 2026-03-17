import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { removeFromCart, updateQuantity, selectCartItems, selectCartTotal } from '../redux/cartSlice'

export default function CartDrawer({ open, onClose }) {
  const dispatch = useDispatch()
  const items    = useSelector(selectCartItems)
  const total    = useSelector(selectCartTotal)

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          display: open ? 'block' : 'none',
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)', zIndex: 300
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 380, background: 'var(--white)',
        boxShadow: 'var(--shadow-xl)',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        zIndex: 301, display: 'flex', flexDirection: 'column'
      }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem' }}>
            Cart ({items.length})
          </h3>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: 'var(--radius-md)', color: 'var(--gray-500)', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div className="empty-state">
              <h4>Your cart is empty</h4>
              <p>Add products to get started</p>
            </div>
          ) : items.map((item) => (
            <div key={item._id} style={{ display: 'flex', gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--gray-100)' }}>
              <img src={item.image || 'https://placehold.co/60x60/f1f5f9/94a3b8?text=+'} alt={item.name}
                style={{ width: 60, height: 60, borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: 4 }}>{item.name}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: 8 }}>₹{item.price.toLocaleString()}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="qty-selector" style={{ transform: 'scale(0.9)', transformOrigin: 'left' }}>
                    <button className="qty-btn" onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}>−</button>
                    <input className="qty-value" value={item.quantity} readOnly />
                    <button className="qty-btn" onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}>+</button>
                  </div>
                  <button onClick={() => dispatch(removeFromCart(item._id))}
                    style={{ color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', whiteSpace: 'nowrap' }}>
                ₹{(item.price * item.quantity).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800 }}>₹{total.toLocaleString()}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="btn btn-primary btn-full btn-lg">Checkout</Link>
          </div>
        )}
      </div>
    </>
  )
}