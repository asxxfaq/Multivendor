// src/pages/auth/Login.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, clearError } from '../../redux/authSlice'
import { toast } from 'react-toastify'
import '../../styles/auth.css'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector(s => s.auth)

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  // Already logged in → redirect based on role
  useEffect(() => {
    if (user) {
      if (user.role === 'admin')  navigate('/admin',  { replace: true })
      else if (user.role === 'vendor') navigate('/vendor', { replace: true })
      else                             navigate('/',        { replace: true })
    }
    return () => dispatch(clearError())
  }, [user])

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(res)) {
      const role = res.payload.role
      toast.success(`Welcome back, ${res.payload.name}!`)
      if (role === 'admin')       navigate('/admin',  { replace: true })
      else if (role === 'vendor') navigate('/vendor', { replace: true })
      else                        navigate('/',        { replace: true })
    } else if (res.payload?.includes?.('not verified')) {
      navigate('/verify-otp', { state: { email: form.email, mode: 'register' } })
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

          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to your account. You will be redirected based on your role.
          </p>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                autoFocus
              />
            </div>

            <div className="form-group">
              <div className="auth-label-row">
                <label className="form-label">Password</label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-wrap">
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={setF('password')}
                  required
                  autoComplete="current-password"
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

            <button
              className="btn btn-dark btn-full btn-lg auth-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Role info */}
          <div className="auth-role-hint">
            <div className="role-hint-item">
              <span className="role-hint-icon">🛍️</span>
              <span>Customer → Shop</span>
            </div>
            <div className="role-hint-divider">·</div>
            <div className="role-hint-item">
              <span className="role-hint-icon">🏪</span>
              <span>Vendor → Dashboard</span>
            </div>
            <div className="role-hint-divider">·</div>
            <div className="role-hint-item">
              <span className="role-hint-icon">⚙️</span>
              <span>Admin → Panel</span>
            </div>
          </div>

          <p className="auth-footer">
            New to MultiShop?{' '}
            <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>

      {/* ── Right: Illustration ── */}
      <div className="auth-illustration">
        <div className="auth-illus-inner">
          <div className="auth-illus-icon">🔐</div>
          <h2>Secure Login</h2>
          <p>
            One login for all roles. You are automatically redirected
            to the right place based on your account type.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">🛍️</div>
              <p>
                <strong>Customer</strong>
                Browse, buy and track your orders
              </p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🏪</div>
              <p>
                <strong>Vendor</strong>
                Manage your store, products and earnings
              </p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">⚙️</div>
              <p>
                <strong>Admin</strong>
                Full platform management and analytics
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}