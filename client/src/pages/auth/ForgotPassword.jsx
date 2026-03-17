import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../../styles/auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ForgotPassword() {
  const navigate  = useNavigate()
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${API}/auth/forgot-password`, { email })
      toast.success('Password reset OTP sent to your email!')
      navigate('/verify-otp', { state: { email, mode: 'forgot' } })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Email not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left: Form ── */}
      <div className="auth-panel">
        <div className="auth-form-wrap">

          <Link to="/" className="auth-logo">
            <span className="auth-logo-text">MultiShop</span>
            <span className="auth-logo-sub">Premium Marketplace</span>
          </Link>

          <div className="otp-icon">🔑</div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            No worries! Enter your registered email and we'll send you a 6-digit OTP to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              className="btn btn-dark btn-full btn-lg auth-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  Sending OTP…
                </span>
              ) : 'Send Reset OTP'}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: 24 }}>
            Remembered your password? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      {/* ── Right: Illustration ── */}
      <div className="auth-illustration">
        <div className="auth-illus-inner">
          <div className="auth-illus-icon">🗝️</div>
          <h2>Reset Your Password</h2>
          <p>We'll send a one-time password to your email. Use it to set a new password for your account.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">📧</div>
              <p><strong>Check your inbox</strong><br/>OTP will arrive within seconds</p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">⏱️</div>
              <p><strong>Valid 15 minutes</strong><br/>Use it before it expires</p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🔒</div>
              <p><strong>Secure process</strong><br/>Your account stays protected</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
