// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './styles/global.css'

import Navbar         from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import DashLayout     from './components/DashLayout'

// ── Auth ──────────────────────────────────────
import Login          from './pages/auth/Login'
import Register       from './pages/auth/Register'
import VerifyOTP      from './pages/auth/VerifyOTP'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// ── Customer ──────────────────────────────────
import Home          from './pages/customer/Home'
import Shop          from './pages/customer/Shop'
import ProductDetail from './pages/customer/ProductDetail'
import Cart          from './pages/customer/Cart'
import Checkout      from './pages/customer/Checkout'
import Orders        from './pages/customer/Orders'
import Profile       from './pages/customer/Profile'

// ── Vendor ────────────────────────────────────
import VendorDashboard from './pages/vendor/Dashboard'
import VendorProducts  from './pages/vendor/Products'
import AddProduct      from './pages/vendor/AddProducts'
import VendorOrders    from './pages/vendor/Orders'
import VendorEarnings  from './pages/vendor/Earnings'

// ── Admin ─────────────────────────────────────
import AdminDashboard  from './pages/admin/Dashboard'
import AdminVendors    from './pages/admin/Vendors'
import AdminUsers      from './pages/admin/Users'
import AdminOrders     from './pages/admin/Orders'
import AdminCategories from './pages/admin/Categories'

// ── Smart redirect based on role ──────────────
function RoleRedirect() {
  const { user } = useSelector(s => s.auth)
  if (!user)               return <Navigate to="/login"  replace />
  if (user.role === 'admin')  return <Navigate to="/admin"  replace />
  if (user.role === 'vendor') return <Navigate to="/vendor" replace />
  return <Navigate to="/"     replace />
}

// ── Storefront layout with Navbar ─────────────
function StoreLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

// ── Guard: vendor/admin cannot access customer pages ──
function CustomerGuard({ children }) {
  const { user } = useSelector(s => s.auth)
  if (user?.role === 'vendor') return <Navigate to="/vendor" replace />
  if (user?.role === 'admin')  return <Navigate to="/admin"  replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
      />
      <Routes>

        {/* ── Auth pages — no navbar ────────────── */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/verify-otp"      element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* ── Public storefront ─────────────────── */}
        {/* Vendor/admin visiting home → redirect to their dashboard */}
        <Route path="/" element={
          <CustomerGuard>
            <StoreLayout><Home /></StoreLayout>
          </CustomerGuard>
        } />
        <Route path="/shop" element={
          <CustomerGuard>
            <StoreLayout><Shop /></StoreLayout>
          </CustomerGuard>
        } />
        <Route path="/product/:id" element={
          <CustomerGuard>
            <StoreLayout><ProductDetail /></StoreLayout>
          </CustomerGuard>
        } />
        <Route path="/cart" element={
          <CustomerGuard>
            <StoreLayout><Cart /></StoreLayout>
          </CustomerGuard>
        } />

        {/* ── Customer protected ────────────────── */}
        <Route element={<ProtectedRoute role="customer" />}>
          <Route path="/checkout" element={<StoreLayout><Checkout /></StoreLayout>} />
          <Route path="/orders"   element={<StoreLayout><Orders /></StoreLayout>} />
          <Route path="/profile"  element={<StoreLayout><Profile /></StoreLayout>} />
        </Route>

        {/* ── Vendor dashboard ──────────────────── */}
        <Route element={<ProtectedRoute role="vendor" />}>
          <Route element={<DashLayout />}>
            <Route path="/vendor"          element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<VendorProducts />} />
            <Route path="/vendor/add"      element={<AddProduct />} />
            <Route path="/vendor/edit/:id" element={<AddProduct />} />
            <Route path="/vendor/orders"   element={<VendorOrders />} />
            <Route path="/vendor/earnings" element={<VendorEarnings />} />
          </Route>
        </Route>

        {/* ── Admin dashboard ───────────────────── */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route element={<DashLayout />}>
            <Route path="/admin"            element={<AdminDashboard />} />
            <Route path="/admin/vendors"    element={<AdminVendors />} />
            <Route path="/admin/users"      element={<AdminUsers />} />
            <Route path="/admin/orders"     element={<AdminOrders />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
          </Route>
        </Route>

        {/* ── Smart redirect for /dashboard ─────── */}
        <Route path="/dashboard" element={<RoleRedirect />} />

        {/* ── 404 ───────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}