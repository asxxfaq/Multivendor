// src/pages/auth/Register.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { clearError } from '../../redux/authSlice'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../../styles/auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useSelector(s => s.auth)

  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
    role:            params.get('role') || 'customer',
  })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]   = useState(false)

  // ✅ Already logged in — redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin')       navigate('/admin',  { replace: true })
      else if (user.role === 'vendor') navigate('/vendor', { replace: true })
      else                             navigate('/',        { replace: true })
    }
    return () => dispatch(clearError())
  }, [user])

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim())
      return toast.error('Full name is required')
    if (form.password !== form.confirmPassword)
      return toast.error('Passwords do not match')
    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await axios.post(`${API}/auth/register/send-otp`, {
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        role:     form.role,
      })
      toast.success('OTP sent to your email!')
      // ✅ Pass role in state so VerifyOTP can redirect correctly after verification
      navigate('/verify-otp', {
        state: {
          email: form.email.trim(),
          mode:  'register',
          role:  form.role,
        },
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'customer', icon: '🛍️', name: 'Customer', desc: 'Browse & buy products' },
    { value: 'vendor',   icon: '🏪', name: 'Vendor',   desc: 'Sell your products' },
  ]

  return (
    <div className="auth-page">

      {/* ── Left: Form ── */}
      <div className="auth-panel">
        <div className="auth-form-wrap">

          {/* Logo */}
          <Link to="/" className="auth-logo">
            <span className="auth-logo-text">MultiShop</span>
            <span className="auth-logo-sub">Premium Marketplace</span>
          </Link>

          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Join as a customer or vendor. We'll verify your email with an OTP.
          </p>

          {/* Role Selector */}
          <div className="auth-role-selector">
            {roles.map(r => (
              <label
                key={r.value}
                className={`role-option ${form.role === r.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={form.role === r.value}
                  onChange={setF('role')}
                />
                <span className="role-icon">{r.icon}</span>
                <span className="role-name">{r.name}</span>
                <span className="role-desc">{r.desc}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={setF('name')}
                required
                autoComplete="name"
                autoFocus
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={setF('email')}
                required
                autoComplete="email"
              />
            </div>

            {/* Password row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="form-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={setF('password')}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPass(s => !s)}
                    tabIndex={-1}
                  >
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="form-input"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={setF('confirmPassword')}
                    required
                    autoComplete="new-password"
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
                {/* Match indicator */}
                {form.confirmPassword && (
                  <p style={{
                    fontSize:  '0.75rem',
                    marginTop: 4,
                    color: form.password === form.confirmPassword
                      ? 'var(--success)'
                      : 'var(--danger)',
                  }}>
                    {form.password === form.confirmPassword
                      ? '✓ Passwords match'
                      : '✗ Passwords do not match'
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              className="btn btn-dark btn-full btn-lg auth-submit-btn"
              type="submit"
              disabled={loading || (form.confirmPassword && form.password !== form.confirmPassword)}
              style={{ marginTop: 4 }}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  Sending OTP…
                </span>
              ) : 'Continue →'}
            </button>
          </form>

          <p className="auth-terms">
            By signing up you agree to our{' '}
            <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
          </p>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      {/* ── Right: Illustration ── */}
      <div className="auth-illustration">
        <div className="auth-illus-inner">
          <div className="auth-illus-icon">🏪</div>
          <h2>Start Your Journey</h2>
          <p>
            Join thousands of customers and vendors on India's fastest growing marketplace.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">📧</div>
              <p>
                <strong>Email Verified</strong>
                OTP sent to your email for secure signup
              </p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🚀</div>
              <p>
                <strong>Instant Access</strong>
                Start shopping or selling in minutes
              </p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">💰</div>
              <p>
                <strong>Zero Cost</strong>
                Free to join, no hidden charges
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}