import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../../styles/auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ResetPassword() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { email, resetToken } = location.state || {}

  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [showNew, setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]     = useState(false)

  useEffect(() => {
    if (!email || !resetToken) navigate('/forgot-password', { replace: true })
  }, [email, resetToken])

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Password strength
  const getStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 6)  score++
    if (pwd.length >= 10) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }
  const strength = getStrength(form.newPassword)
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['', '#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword)
      return toast.error('Passwords do not match')
    if (form.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await axios.post(`${API}/auth/reset-password`, {
        email,
        resetToken,
        newPassword: form.newPassword,
      })
      toast.success('Password reset successfully! Please log in.')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
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

          <div className="otp-icon">🔐</div>
          <h1 className="auth-title">Set New Password</h1>
          <p className="auth-subtitle">
            Create a strong password for your account <strong>{email}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="auth-input-wrap">
                <input
                  className="form-input"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.newPassword}
                  onChange={setF('newPassword')}
                  required
                  minLength={6}
                  autoFocus
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowNew(s => !s)}
                  tabIndex={-1}
                >
                  {showNew ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Password strength bar */}
              {form.newPassword && (
                <div className="pwd-strength">
                  <div className="pwd-strength-bars">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className="pwd-strength-bar"
                        style={{ background: i <= strength ? strengthColors[strength] : '#e8e6e1' }}
                      />
                    ))}
                  </div>
                  <span className="pwd-strength-label" style={{ color: strengthColors[strength] }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="auth-input-wrap">
                <input
                  className="form-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat new password"
                  value={form.confirmPassword}
                  onChange={setF('confirmPassword')}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm(s => !s)}
                  tabIndex={-1}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="form-error">Passwords do not match</p>
              )}
            </div>

            <button
              className="btn btn-dark btn-full btn-lg auth-submit-btn"
              type="submit"
              disabled={loading || form.newPassword !== form.confirmPassword}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  Resetting…
                </span>
              ) : 'Reset Password'}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: 24 }}>
            <Link to="/login">← Back to Login</Link>
          </p>
        </div>
      </div>

      {/* ── Right: Illustration ── */}
      <div className="auth-illustration">
        <div className="auth-illus-inner">
          <div className="auth-illus-icon">🛡️</div>
          <h2>Strong Password Tips</h2>
          <p>Create a password that keeps your account secure.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">📏</div>
              <p><strong>At least 8 characters</strong><br/>Longer passwords are harder to crack</p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🔣</div>
              <p><strong>Mix characters</strong><br/>Use uppercase, numbers and symbols</p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🚫</div>
              <p><strong>Avoid common words</strong><br/>Don't use name, birthday or "password"</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
