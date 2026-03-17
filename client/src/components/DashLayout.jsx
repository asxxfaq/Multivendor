// src/components/DashLayout.jsx
import { useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import DashSidebar from './DashSidebar'
import '../styles/dashboard.css'

// ── Map paths to page titles ──────────────────
const PAGE_TITLES = {
  // Vendor
  '/vendor':          { title: 'Dashboard',    sub: 'Welcome back' },
  '/vendor/products': { title: 'My Products',  sub: 'Manage your product listings' },
  '/vendor/add':      { title: 'Add Product',  sub: 'List a new product in your store' },
  '/vendor/orders':   { title: 'Orders',       sub: 'View and manage customer orders' },
  '/vendor/earnings': { title: 'Earnings',     sub: 'Your revenue and payout summary' },
  // Admin
  '/admin':              { title: 'Dashboard',   sub: 'Platform overview' },
  '/admin/vendors':      { title: 'Vendors',     sub: 'Manage vendor accounts' },
  '/admin/users':        { title: 'Users',       sub: 'Manage customer accounts' },
  '/admin/orders':       { title: 'Orders',      sub: 'All platform orders' },
  '/admin/categories':   { title: 'Categories',  sub: 'Manage product categories' },
}

export default function DashLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user }     = useSelector(s => s.auth)
  const { pathname } = useLocation()

  // Get title — handle dynamic routes like /vendor/edit/:id
  const getPageInfo = () => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
    if (pathname.startsWith('/vendor/edit/')) return { title: 'Edit Product', sub: 'Update your product details' }
    if (pathname.startsWith('/vendor/')) return { title: 'Vendor Panel', sub: '' }
    if (pathname.startsWith('/admin/'))  return { title: 'Admin Panel',  sub: '' }
    return { title: 'Dashboard', sub: '' }
  }

  const { title, sub } = getPageInfo()

  return (
    <div className="dash-layout">

      {/* ── Sidebar ── */}
      <DashSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main ── */}
      <div className="dash-main">

        {/* ── Topbar ── */}
        <header className="dash-topbar">

          {/* Left — hamburger + title */}
          <div className="dash-topbar-left">
            <button
              className="dash-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            {/* Page title — hidden on mobile, shown on desktop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{
                fontFamily:   'var(--font-display)',
                fontSize:     '1rem',
                fontWeight:   500,
                color:        'var(--charcoal, #1A1A1A)',
                letterSpacing: '0.02em',
                lineHeight:   1.2,
              }}>
                {title}
              </span>
              {sub && (
                <span style={{
                  fontSize:   '0.75rem',
                  color:      'var(--gray-400)',
                  fontWeight: 300,
                  lineHeight: 1,
                }}>
                  {sub}
                </span>
              )}
            </div>
          </div>

          {/* Right — notification + visit shop + user */}
          <div className="dash-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Visit shop */}
            <Link
              to="/"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            6,
                padding:        '6px 12px',
                fontSize:       '0.75rem',
                fontWeight:     500,
                letterSpacing:  '0.06em',
                textTransform:  'uppercase',
                color:          'var(--gray-600)',
                background:     'var(--gray-50)',
                border:         '1px solid var(--gray-200)',
                textDecoration: 'none',
                transition:     'all 0.2s',
                whiteSpace:     'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold, #C9A84C)'
                e.currentTarget.style.color = 'var(--gold-dark, #9A7A2E)'
                e.currentTarget.style.background = 'var(--gold-faint, #FDF8EE)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--gray-200)'
                e.currentTarget.style.color = 'var(--gray-600)'
                e.currentTarget.style.background = 'var(--gray-50)'
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              <span className="hide-mobile">Shop</span>
            </Link>

            {/* Notification bell */}
            <button
              style={{
                width:          36,
                height:         36,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                background:     'none',
                border:         '1px solid var(--gray-200)',
                color:          'var(--gray-500)',
                cursor:         'pointer',
                transition:     'all 0.2s',
                flexShrink:     0,
                position:       'relative',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold, #C9A84C)'
                e.currentTarget.style.color = 'var(--gold-dark, #9A7A2E)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--gray-200)'
                e.currentTarget.style.color = 'var(--gray-500)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
            </button>

            {/* User avatar + name */}
            <div style={{
              display:     'flex',
              alignItems:  'center',
              gap:         8,
              padding:     '5px 10px 5px 5px',
              border:      '1px solid var(--gray-200)',
              background:  'var(--white)',
              cursor:      'default',
            }}>
              <div style={{
                width:          30,
                height:         30,
                background:     'var(--maroon, #6B0F1A)',
                color:          'white',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       '0.75rem',
                fontWeight:     600,
                fontFamily:     'var(--font-display)',
                overflow:       'hidden',
                flexShrink:     0,
              }}>
                {user?.avatar
                  ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : user?.name?.[0]?.toUpperCase()
                }
              </div>
              <div className="hide-mobile" style={{ minWidth: 0 }}>
                <div style={{
                  fontSize:     '0.8125rem',
                  fontWeight:   500,
                  color:        'var(--charcoal)',
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth:     100,
                  lineHeight:   1.2,
                }}>
                  {user?.name}
                </div>
                <div style={{
                  fontSize:      '0.625rem',
                  color:         'var(--gray-400)',
                  textTransform: 'capitalize',
                  letterSpacing: '0.06em',
                  lineHeight:    1,
                }}>
                  {user?.role}
                </div>
              </div>
            </div>

          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="dash-content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}