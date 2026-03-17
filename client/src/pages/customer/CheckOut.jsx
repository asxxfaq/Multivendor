import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectCartItems, selectCartTotal, clearCart } from '../../redux/cartSlice'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'
import '../../styles/customer.css'

export default function Checkout() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const items     = useSelector(selectCartItems)
  const total     = useSelector(selectCartTotal)
  const shipping  = total >= 499 ? 0 : 49
  const grandTotal = total + shipping

  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' })
  const [step, setStep]   = useState(1) // 1=address 2=payment
  const [loading, setLoading] = useState(false)

  const setField = (k) => (e) => setAddress(a => ({...a, [k]: e.target.value}))

  const handleAddressNext = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePayment = async () => {
    setLoading(true)
    try {
      // 1. Create Razorpay order
      const { data: order } = await api.post('/payment/create-order', { amount: grandTotal })

      // 2. Open Razorpay checkout
      const options = {
        key:      import.meta.env.VITE_RAZORPAY_KEY_ID || order.key,
        amount:   order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name:     'MultiShop',
        description: 'Order Payment',
        handler: async (response) => {
          // 3. Verify payment
          const verify = await api.post('/payment/verify', response)
          if (!verify.data.success) return toast.error('Payment verification failed')

          // 4. Place order
          await api.post('/orders', {
            items: items.map(i => ({ productId: i._id, quantity: i.quantity })),
            shippingAddress: address,
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          })
          dispatch(clearCart())
          toast.success('Order placed successfully!')
          navigate('/orders')
        },
        prefill:  { name: address.name, contact: address.phone },
        theme:    { color: '#f97316' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1 className="page-title" style={{ paddingTop: 32 }}>Checkout</h1>

      {/* Steps */}
      <div className="checkout-steps">
        {['Address','Payment','Confirmation'].map((label, i) => (
          <>
            {i > 0 && <div key={`d${i}`} className="checkout-step-divider" />}
            <div key={label} className={`checkout-step ${step > i ? 'done' : step === i + 1 ? 'active' : ''}`}>
              <div className="checkout-step-num">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="checkout-step-label">{label}</span>
            </div>
          </>
        ))}
      </div>

      <div className="checkout-layout">
        <div>
          {step === 1 && (
            <div className="card">
              <div className="card-header"><h3>Shipping Address</h3></div>
              <div className="card-body">
                <form onSubmit={handleAddressNext}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" value={address.name} onChange={setField('name')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-input" value={address.phone} onChange={setField('phone')} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street Address</label>
                    <input className="form-input" value={address.street} onChange={setField('street')} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input className="form-input" value={address.city} onChange={setField('city')} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input className="form-input" value={address.state} onChange={setField('state')} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Pincode</label>
                    <input className="form-input" value={address.pincode} onChange={setField('pincode')} required maxLength={6} />
                  </div>
                  <button className="btn btn-primary btn-lg" type="submit">Continue to Payment →</button>
                </form>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card">
              <div className="card-header">
                <h3>Payment Method</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Edit Address</button>
              </div>
              <div className="card-body">
                <div className="address-card selected" style={{ marginBottom: 20 }}>
                  <div className="address-card-header">
                    <span className="address-label">Delivering to</span>
                  </div>
                  <div className="address-text">{address.name} • {address.phone}<br/>{address.street}, {address.city}, {address.state} — {address.pincode}</div>
                </div>
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? 'Processing…' : `Pay ₹${grandTotal.toLocaleString()} with Razorpay`}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--gray-400)', marginTop: 12 }}>
                  🔒 Secured by Razorpay • 256-bit SSL
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          {items.map(item => (
            <div key={item._id} className="summary-row">
              <span style={{ fontSize: '0.875rem' }}>{item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{grandTotal.toLocaleString()}</span></div>
        </div>
      </div>
    </div>
  )
}