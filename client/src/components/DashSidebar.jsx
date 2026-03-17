// src/components/DashSidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../redux/authSlice'

const vendorLinks = [
  { to: '/vendor',          icon: 'grid',    label: 'Dashboard',    section: 'main' },
  { to: '/vendor/products', icon: 'package', label: 'My Products',  section: 'main' },
  { to: '/vendor/add',      icon: 'plus',    label: 'Add Product',  section: 'main' },
  { to: '/vendor/orders',   icon: 'orders',  label: 'Orders',       section: 'main' },
  { to: '/vendor/earnings', icon: 'rupee',   label: 'Earnings',     section: 'main' },
]

const adminLinks = [
  { to: '/admin',             icon: 'grid',   label: 'Dashboard',  section: 'main'     },
  { to: '/admin/vendors',     icon: 'store',  label: 'Vendors',    section: 'main'     },
  { to: '/admin/users',       icon: 'users',  label: 'Users',      section: 'main'     },
  { to: '/admin/orders',      icon: 'orders', label: 'Orders',     section: 'main'     },
  { to: '/admin/categories',  icon: 'tag',    label: 'Categories', section: 'settings' },
]

// ── SVG Icons ─────────────────────────────────
const icons = {
  grid:    <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  package: <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>,
  plus:    <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>,
  orders:  <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
  rupee:   <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></>,
  store:   <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  users:   <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  tag:     <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></>,
  shop:    <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
  logout:  <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
}

const Icon = ({ name }) => (
  <svg
    width="17" height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    {icons[name]}
  </svg>
)

export default function DashSidebar({ open, onClose }) {
  const { user }     = useSelector(s => s.auth)
  const dispatch     = useDispatch()
  const navigate     = useNavigate()
  const { pathname } = useLocation()

  const isAdmin   = user?.role === 'admin'
  const links     = isAdmin ? adminLinks : vendorLinks
  const mainLinks = links.filter(l => l.section === 'main')
  const settLinks = links.filter(l => l.section === 'settings')

  // Active check — exact match for dashboard, startsWith for others
  const isActive = (to) => {
    if (to === '/vendor' || to === '/admin') return pathname === to
    return pathname.startsWith(to)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`dash-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`dash-sidebar ${open ? 'open' : ''}`}>

        {/* ── Logo ── */}
        <div className="dash-sidebar-logo">
          <Link to="/" className="dash-sidebar-logo-text">
            Multi<span>Shop</span>
          </Link>
          <span className="dash-sidebar-logo-badge">
            {isAdmin ? 'Admin' : 'Vendor'}
          </span>
        </div>

        {/* ── Main Links ── */}
        <div className="dash-sidebar-section">
          {isAdmin ? 'Management' : 'Store'}
        </div>
        {mainLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`dash-nav-item ${isActive(link.to) ? 'active' : ''}`}
            onClick={onClose}
          >
            <Icon name={link.icon} />
            {link.label}
          </Link>
        ))}

        {/* ── Settings Links ── */}
        {settLinks.length > 0 && (
          <>
            <div className="dash-sidebar-section">Settings</div>
            {settLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`dash-nav-item ${isActive(link.to) ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon name={link.icon} />
                {link.label}
              </Link>
            ))}
          </>
        )}

        {/* ── Visit Shop link ── */}
        <div style={{ margin: '8px 12px 0', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
          <Link
            to="/"
            className="dash-nav-item"
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8125rem' }}
            onClick={onClose}
          >
            <Icon name="shop" />
            Visit Shop
          </Link>
        </div>

        {/* ── Footer ── */}
        <div className="dash-sidebar-footer">

          {/* User info */}
          <div className="dash-sidebar-user" style={{ cursor: 'default' }}>
            <div className="dash-sidebar-avatar">
              {user?.avatar
                ? <img src={user.avatar} alt="" />
                : user?.name?.[0]?.toUpperCase()
              }
            </div>
            <div className="dash-sidebar-user-info">
              <div className="dash-sidebar-user-name">{user?.name}</div>
              <div className="dash-sidebar-user-role" style={{ textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>

          {/* Logout button — separate from user info */}
          <button
            onClick={handleLogout}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            10,
              width:          '100%',
              padding:        '10px 12px',
              marginTop:      4,
              background:     'none',
              border:         '1px solid rgba(255,255,255,0.08)',
              borderRadius:   'var(--radius-md)',
              color:          'rgba(255,255,255,0.45)',
              fontSize:       '0.8125rem',
              cursor:         'pointer',
              transition:     'all 0.2s',
              fontFamily:     'var(--font-body)',
              letterSpacing:  '0.04em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background    = 'rgba(239,68,68,0.12)'
              e.currentTarget.style.color         = '#fca5a5'
              e.currentTarget.style.borderColor   = 'rgba(239,68,68,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background    = 'none'
              e.currentTarget.style.color         = 'rgba(255,255,255,0.45)'
              e.currentTarget.style.borderColor   = 'rgba(255,255,255,0.08)'
            }}
          >
            <Icon name="logout" />
            Logout
          </button>
        </div>

      </aside>
    </>
  )
}