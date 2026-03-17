// src/pages/customer/Profile.jsx
import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../../redux/authSlice'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

export default function Profile() {
  const { user }  = useSelector(s => s.auth)
  const dispatch  = useDispatch()

  const [tab, setTab]         = useState('profile')
  const [form, setForm]       = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const fileRef = useRef(null)

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setP = k => e => setPwdForm(f => ({ ...f, [k]: e.target.value }))

  // ── Avatar Upload ─────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = e => setAvatarPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload to backend
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('avatar', file)

      const { data } = await api.put('/auth/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      dispatch(updateUser(data))
      setAvatarPreview(data.avatar || avatarPreview)
      toast.success('Profile photo updated!')
    } catch (err) {
      console.error('Avatar upload error:', err)
      toast.error(err.response?.data?.message || 'Upload failed')
      // Revert preview on error
      setAvatarPreview(user?.avatar || '')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // ── Profile Save ──────────────────────────────
  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    setSaving(true)
    try {
      const { data } = await api.put('/auth/profile', {
        name:  form.name.trim(),
        phone: form.phone.trim(),
      })
      dispatch(updateUser(data))
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  // ── Password Change ───────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword)
      return toast.error('Passwords do not match')
    if (pwdForm.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'

  return (
    <div style={{
      minHeight:  '100vh',
      background: 'var(--gray-50, #f8fafc)',
      padding:    '40px 16px 80px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', width: '100%' }}>

        {/* ── Page Title ── */}
        <h1 style={{
          fontFamily:    'var(--font-display)',
          fontSize:      '1.75rem',
          fontWeight:    700,
          color:         'var(--gray-900)',
          marginBottom:  28,
          letterSpacing: '0.02em',
        }}>
          My Profile
        </h1>

        {/* ── Avatar Card ── */}
        <div style={{
          background:   'var(--white)',
          border:       '1px solid var(--gray-100)',
          borderRadius: 'var(--radius-xl, 16px)',
          padding:      '24px',
          marginBottom: 24,
          display:      'flex',
          alignItems:   'center',
          gap:          20,
          flexWrap:     'wrap',
          boxShadow:    'var(--shadow-sm)',
        }}>

          {/* Avatar with upload button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Avatar circle */}
            <div style={{
              width:          80,
              height:         80,
              borderRadius:   '50%',
              background:     'var(--maroon, #6B0F1A)',
              color:          'white',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       '1.625rem',
              fontWeight:     700,
              overflow:       'hidden',
              fontFamily:     'var(--font-display)',
              border:         '3px solid var(--gold-light, #E8C96A)',
              position:       'relative',
            }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={() => setAvatarPreview('')}
                />
              ) : (
                initials
              )}

              {/* Upload loading overlay */}
              {uploading && (
                <div style={{
                  position:       'absolute',
                  inset:          0,
                  background:     'rgba(0,0,0,0.5)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  borderRadius:   '50%',
                }}>
                  <div style={{
                    width:       20,
                    height:      20,
                    border:      '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation:   'spin 0.7s linear infinite',
                  }} />
                </div>
              )}
            </div>

            {/* Edit button */}
            <label
              title="Change profile photo"
              style={{
                position:       'absolute',
                bottom:         0,
                right:          0,
                background:     uploading ? 'var(--gray-400)' : 'var(--gold, #C9A84C)',
                color:          'white',
                width:          28,
                height:         28,
                borderRadius:   '50%',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                cursor:         uploading ? 'not-allowed' : 'pointer',
                fontSize:       '0.75rem',
                border:         '2px solid white',
                boxShadow:      'var(--shadow-md)',
                transition:     'background 0.2s',
              }}
            >
              {uploading ? '⏳' : '📷'}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
                disabled={uploading}
              />
            </label>
          </div>

          {/* User info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontFamily:    'var(--font-display)',
              fontSize:      '1.25rem',
              fontWeight:    600,
              color:         'var(--gray-900)',
              marginBottom:  4,
              whiteSpace:    'nowrap',
              overflow:      'hidden',
              textOverflow:  'ellipsis',
            }}>
              {user?.name}
            </h3>
            <p style={{
              fontSize:     '0.875rem',
              color:        'var(--gray-500)',
              margin:       '0 0 8px',
              whiteSpace:   'nowrap',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
            }}>
              {user?.email}
            </p>
            {user?.phone && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', margin: '0 0 8px' }}>
                📞 {user.phone}
              </p>
            )}
            <span style={{
              display:       'inline-block',
              padding:       '3px 12px',
              borderRadius:  'var(--radius-full, 9999px)',
              fontSize:      '0.6875rem',
              fontWeight:    600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              background:    user?.role === 'admin'  ? 'var(--danger-light)'  :
                             user?.role === 'vendor' ? 'var(--info-light)'    :
                             'var(--success-light)',
              color:         user?.role === 'admin'  ? 'var(--danger)'  :
                             user?.role === 'vendor' ? 'var(--info)'    :
                             'var(--success)',
            }}>
              {user?.role}
            </span>
          </div>

          {/* Upload hint */}
          <div style={{
            width:     '100%',
            fontSize:  '0.75rem',
            color:     'var(--gray-400)',
            textAlign: 'center',
            marginTop: -8,
          }}>
            Click the 📷 icon to change your profile photo · JPG, PNG, WebP · Max 2MB
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display:      'flex',
          borderBottom: '2px solid var(--gray-200)',
          marginBottom: 24,
        }}>
          {[
            { key: 'profile',  label: 'Profile Info' },
            { key: 'password', label: 'Change Password' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding:       '11px 24px',
                fontSize:      '0.8125rem',
                fontWeight:    500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color:         tab === t.key
                  ? 'var(--maroon, #6B0F1A)'
                  : 'var(--gray-400)',
                background:    'none',
                border:        'none',
                borderBottom:  tab === t.key
                  ? '2px solid var(--maroon, #6B0F1A)'
                  : '2px solid transparent',
                marginBottom:  '-2px',
                cursor:        'pointer',
                transition:    'all 0.2s',
                whiteSpace:    'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Profile Form ── */}
        {tab === 'profile' && (
          <div style={{
            background:   'var(--white)',
            border:       '1px solid var(--gray-100)',
            borderRadius: 'var(--radius-xl, 16px)',
            padding:      '28px',
            boxShadow:    'var(--shadow-sm)',
          }}>
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={setF('name')}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ background: 'var(--gray-50)', cursor: 'not-allowed', opacity: 0.7 }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>
                  Email address cannot be changed
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  className="form-input"
                  value={form.phone}
                  onChange={setF('phone')}
                  placeholder="+91 98765 43210"
                  type="tel"
                />
              </div>

              <div style={{ paddingTop: 8, display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={saving}
                  style={{ minWidth: 140 }}
                >
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 14, height: 14,
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                        flexShrink: 0,
                      }} />
                      Saving…
                    </span>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Password Form ── */}
        {tab === 'password' && (
          <div style={{
            background:   'var(--white)',
            border:       '1px solid var(--gray-100)',
            borderRadius: 'var(--radius-xl, 16px)',
            padding:      '28px',
            boxShadow:    'var(--shadow-sm)',
          }}>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={setP('currentPassword')}
                  required
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={setP('newPassword')}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  className="form-input"
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={setP('confirmPassword')}
                  required
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                />
                {pwdForm.confirmPassword && pwdForm.newPassword !== pwdForm.confirmPassword && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--danger)', marginTop: 6 }}>
                    ⚠ Passwords do not match
                  </p>
                )}
                {pwdForm.confirmPassword && pwdForm.newPassword === pwdForm.confirmPassword && pwdForm.newPassword && (
                  <p style={{ fontSize: '0.8125rem', color: 'var(--success)', marginTop: 6 }}>
                    ✓ Passwords match
                  </p>
                )}
              </div>

              <div style={{ paddingTop: 8 }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={saving || pwdForm.newPassword !== pwdForm.confirmPassword || !pwdForm.newPassword}
                  style={{ minWidth: 140 }}
                >
                  {saving ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 14, height: 14,
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                        flexShrink: 0,
                      }} />
                      Updating…
                    </span>
                  ) : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}