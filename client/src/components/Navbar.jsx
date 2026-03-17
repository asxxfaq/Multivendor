// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/authSlice'
import '../styles/navbar.css'

export default function Navbar() {
  const { user }   = useSelector(s => s.auth)
  const { items }  = useSelector(s => s.cart)
  const dispatch   = useDispatch()
  const navigate   = useNavigate()

  const [menuOpen, setMenuOpen]   = useState(false)
  const [dropOpen, setDropOpen]   = useState(false)
  const [search, setSearch]       = useState('')
  const dropRef                   = useRef(null)

  const cartCount = items?.reduce((sum, i) => sum + i.quantity, 0) || 0

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    setDropOpen(false)
    setMenuOpen(false)
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/shop?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
      setMenuOpen(false)
    }
  }

  // ── Vendor/Admin should never see this Navbar ──
  // They use DashLayout which has its own topbar
  // But just in case, show nothing for them
  if (user?.role === 'vendor' || user?.role === 'admin') return null

  return (
    <nav className="navbar">

      {/* Top strip */}
      <div className="navbar-top-strip">
        Free shipping on orders above ₹999
        <span>|</span>
        Easy 30-day returns
        <span>|</span>
        Secure payments
      </div>

      <div className="container">
        <div className="navbar-inner">

          {/* ── Logo ── */}
          <Link to="/" className="navbar-logo">
            <span className="navbar-logo-text">MultiShop</span>
            <span className="navbar-logo-sub">Premium Marketplace</span>
          </Link>

          {/* ── Search ── */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <svg className="navbar-search-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" width="16" height="16">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>

          {/* ── Actions ── */}
          <div className="navbar-actions">

            {/* Cart — only for customers */}
            <Link to="/cart" className="navbar-icon-btn" title="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" width="20" height="20">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className="navbar-badge">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </Link>

            {/* User section */}
            {user ? (
              <div className="navbar-user" ref={dropRef}>
                <button
                  className="navbar-user-btn"
                  onClick={() => setDropOpen(o => !o)}
                >
                  <div className="navbar-avatar">
                    {user.avatar
                      ? <img src={user.avatar} alt="" />
                      : user.name?.[0]?.toUpperCase()
                    }
                  </div>
                  <span className="navbar-username">{user.name?.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    style={{ transform: dropOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {dropOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-header">
                      <p>{user.name}</p>
                      <p>{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="navbar-dropdown-item"
                      onClick={() => setDropOpen(false)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="navbar-dropdown-item"
                      onClick={() => setDropOpen(false)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                      </svg>
                      My Orders
                    </Link>
                    <div className="navbar-dropdown-divider" />
                    <button
                      className="navbar-dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Sign in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Register
                </Link>
              </div>
            )}

            {/* Hamburger */}
            <button
              className="navbar-hamburger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
        <div className="navbar-mobile-search">
          <form onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
        </div>
        <div className="navbar-mobile-links">
          <Link to="/"     onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>
            Cart {cartCount > 0 && `(${cartCount})`}
          </Link>
          {user ? (
            <>
              <div className="navbar-mobile-divider" />
              <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
              <Link to="/orders"  onClick={() => setMenuOpen(false)}>My Orders</Link>
              <div className="navbar-mobile-divider" />
              <button className="mobile-danger" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="navbar-mobile-divider" />
              <Link to="/login"    onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Create Account</Link>
            </>
          )}
        </div>
      </div>

    </nav>
  )
}