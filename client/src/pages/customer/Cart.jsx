import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { removeFromCart, updateQuantity, clearCart, selectCartItems, selectCartTotal } from '../../redux/cartSlice'
import OrderStatusBadge from '../../components/OrderStatusBadge'
import '../../styles/customer.css'

export default function Cart() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const items     = useSelector(selectCartItems)
  const total     = useSelector(selectCartTotal)
  const shipping  = total >= 499 ? 0 : 49
  const grandTotal = total + shipping

  if (items.length === 0) return (
    <div className="container">
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <h4>Your cart is empty</h4>
        <p style={{ marginBottom: 24 }}>Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn btn-primary btn-lg">Start Shopping</Link>
      </div>
    </div>
  )

  return (
    <div className="container">
      <h1 className="page-title" style={{ paddingTop: 32 }}>Shopping Cart ({items.length} items)</h1>
      <div className="cart-layout">

        {/* Items */}
        <div>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-img">
                  <img src={item.image || 'https://placehold.co/96x96/f1f5f9/94a3b8?text=+'} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <Link to={`/product/${item._id}`} className="cart-item-name">{item.name}</Link>
                  <div className="cart-item-meta">
                    {item.vendor && <span>by {item.vendor}</span>}
                    {item.selectedSize && <span> · Size: {item.selectedSize}</span>}
                  </div>
                  <div className="cart-item-actions">
                    <div className="qty-selector">
                      <button className="qty-btn" onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))}>−</button>
                      <input className="qty-value" value={item.quantity} readOnly />
                      <button className="qty-btn" onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}>+</button>
                    </div>
                    <button className="cart-remove-btn" onClick={() => dispatch(removeFromCart(item._id))}>🗑 Remove</button>
                  </div>
                </div>
                <div className="cart-item-price">₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => dispatch(clearCart())}>Clear Cart</button>
          </div>
        </div>

        {/* Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal ({items.length} items)</span><span>₹{total.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? '🎉 Free' : `₹${shipping}`}</span></div>
          <div className="coupon-row">
            <div className="coupon-input-wrap">
              <input placeholder="Coupon code" />
              <button className="btn btn-secondary btn-sm">Apply</button>
            </div>
          </div>
          <div className="summary-row total"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
          <div className="checkout-btn">
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: 12 }}>
            🔒 Secure checkout powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  )
}