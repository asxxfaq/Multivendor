// pages/auth/VerifyOTP.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser } from '../../redux/authSlice'
import axios from 'axios'
import { toast } from 'react-toastify'
import '../../styles/auth.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function VerifyOTP() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const dispatch   = useDispatch()

  // mode: 'register' | 'forgot'
  const { email, mode = 'register' } = location.state || {}

  const [otp, setOtp]           = useState(['', '', '', '', '', ''])
  const [loading, setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate(mode === 'forgot' ? '/forgot-password' : '/register')
  }, [email])

  // Countdown timer
  useEffect(() => {
    if (countdown === 0) { setCanResend(true); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return  // only digits
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)   // only last digit
    setOtp(newOtp)

    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0)  inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = ['', '', '', '', '', '']
    pasted.split('').forEach((d, i) => { newOtp[i] = d })
    setOtp(newOtp)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const otpValue = otp.join('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (otpValue.length !== 6)
      return toast.error('Please enter the complete 6-digit OTP')

    setLoading(true)
    try {
      if (mode === 'register') {
        // Verify registration OTP → get user + token
        const { data } = await axios.post(`${API}/auth/register/verify-otp`, { email, otp: otpValue })
        dispatch(setUser(data))
        toast.success('Email verified! Welcome to MultiShop 🎉')
        // Role-based redirect
        if (data.role === 'vendor')      navigate('/vendor', { replace: true })
        else if (data.role === 'admin')  navigate('/admin',  { replace: true })
        else                             navigate('/',        { replace: true })

      } else if (mode === 'forgot') {
        // Verify reset OTP → get resetToken
        const { data } = await axios.post(`${API}/auth/verify-reset-otp`, { email, otp: otpValue })
        toast.success('OTP verified!')
        navigate('/reset-password', { state: { email, resetToken: data.resetToken } })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
      // Clear OTP on wrong input
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    setResending(true)
    try {
      if (mode === 'register') {
        await axios.post(`${API}/auth/register/resend-otp`, { email })
      } else {
        await axios.post(`${API}/auth/forgot-password`, { email })
      }
      toast.success('New OTP sent to your email')
      setOtp(['', '', '', '', '', ''])
      setCountdown(60)
      setCanResend(false)
      inputRefs.current[0]?.focus()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-page">

      {/* ── Left: OTP Form ── */}
      <div className="auth-panel">
        <div className="auth-form-wrap">

          <Link to="/" className="auth-logo">
            <span className="auth-logo-text">MultiShop</span>
            <span className="auth-logo-sub">Premium Marketplace</span>
          </Link>

          <div className="otp-icon">📬</div>
          <h1 className="auth-title">
            {mode === 'register' ? 'Verify Your Email' : 'Check Your Email'}
          </h1>
          <p className="auth-subtitle">
            We sent a 6-digit OTP to <strong>{email}</strong>.<br />
            {mode === 'forgot' ? 'Enter it to reset your password.' : 'Enter it to complete registration.'}
          </p>

          <form onSubmit={handleSubmit}>
            {/* OTP Input Boxes */}
            <div className="otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  className={`otp-box ${digit ? 'filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(index, e.target.value)}
                  onKeyDown={e => handleKeyDown(index, e)}
                  autoComplete="off"
                />
              ))}
            </div>

            <button
              className="btn btn-dark btn-full btn-lg auth-submit-btn"
              type="submit"
              disabled={loading || otpValue.length !== 6}
            >
              {loading ? (
                <span className="auth-loading">
                  <span className="auth-spinner" />
                  Verifying…
                </span>
              ) : mode === 'register' ? 'Verify & Continue' : 'Verify OTP'}
            </button>
          </form>

          {/* Resend */}
          <div className="otp-resend">
            {canResend ? (
              <button
                className="otp-resend-btn"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending…' : 'Resend OTP'}
              </button>
            ) : (
              <p className="otp-countdown">
                Resend OTP in <span>{countdown}s</span>
              </p>
            )}
          </div>

          <p className="auth-footer" style={{ marginTop: 20 }}>
            Wrong email?{' '}
            <Link to={mode === 'register' ? '/register' : '/forgot-password'}>
              Go back
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Illustration ── */}
      <div className="auth-illustration">
        <div className="auth-illus-inner">
          <div className="auth-illus-icon">🔒</div>
          <h2>Secure Verification</h2>
          <p>We use OTP verification to ensure your account is protected against unauthorized access.</p>
          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">⏱️</div>
              <p><strong>Valid for 10 Minutes</strong><br />OTP expires automatically for security</p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">📱</div>
              <p><strong>Check Spam Folder</strong><br />If you don't see the email, check spam</p>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🔄</div>
              <p><strong>Can Resend</strong><br />Request a new OTP after 60 seconds</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
