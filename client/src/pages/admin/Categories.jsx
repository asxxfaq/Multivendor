import { useEffect, useState } from 'react'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)

  const [page, setPage]             = useState(1)
  const [pages, setPages]           = useState(1)
  const [total, setTotal]           = useState(0)
  const [limit]                     = useState(10)
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const load = () => {
    setLoading(true)
    api.get(`/admin/categories?page=${page}&limit=${limit}&search=${debouncedSearch}`)
      .then(r => {
        setCategories(r.data.categories || [])
        setTotal(r.data.total || 0)
        setPages(r.data.pages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    load()
  }, [page, debouncedSearch])

  const setF = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) await api.put(`/admin/categories/${editId}`, form)
      else        await api.post('/admin/categories', form)
      toast.success(editId ? 'Category updated!' : 'Category created!')
      setShowForm(false)
      setForm({ name: '', description: '' })
      setEditId(null)
      load()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      setCategories(c => c.filter(x => x._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed') }
  }

  const handleEdit = (cat) => {
    setEditId(cat._id)
    setForm({ name: cat.name, description: cat.description || '' })
    setShowForm(true)
  }

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">Categories</div>
          <div className="dash-content-subtitle">{total} product categories</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '' }) }}>+ Add Category</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3>{editId ? 'Edit Category' : 'New Category'}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Category Name *</label><input className="form-input" value={form.name} onChange={setF('name')} required placeholder="e.g. Shirts" /></div>
                <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={setF('description')} placeholder="Optional description" /></div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Create'}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="data-card">
        <div className="data-card-header">
          <h3>All Categories</h3>
          <div className="data-card-tools">
            <div className="search-input-wrap">
              <svg className="search-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Search categories…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                    {debouncedSearch ? `No categories match "${debouncedSearch}"` : 'No categories found'}
                  </td>
                </tr>
              ) : categories.map(cat => (
                <tr key={cat._id}>
                  <td style={{ fontWeight: 600 }}>{cat.name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{cat.slug}</td>
                  <td style={{ color: 'var(--gray-500)', maxWidth: 200 }}>{cat.description || '—'}</td>
                  <td><span className={`badge ${cat.isActive ? 'badge-success' : 'badge-gray'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(cat)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with pagination */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '16px 24px',
          borderTop:      '1px solid var(--gray-100)',
          background:     'var(--ivory, #FDFAF4)',
          fontSize:       '0.8125rem',
          color:          'var(--gray-500)',
          fontWeight:     300,
          flexWrap:       'wrap',
          gap:            16,
        }}>
          <span>
            Showing <strong style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{categories.length}</strong> of{' '}
            <strong style={{ color: 'var(--gray-800)', fontWeight: 500 }}>{total}</strong> categories
            {debouncedSearch && ` matching "${debouncedSearch}"`}
          </span>

          {pages > 1 && (
            <div className="pagination" style={{ padding: 0, marginTop: 0 }}>
              <button onClick={() => setPage(1)} disabled={page === 1} style={{ width: 34, height: 34 }}>&laquo;&laquo;</button>
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} style={{ width: 34, height: 34 }}>&laquo;</button>
              {(() => {
                const range = []
                const maxVisible = 5
                let start = Math.max(1, page - 2)
                let end = Math.min(pages, start + maxVisible - 1)
                if (end - start + 1 < maxVisible) {
                  start = Math.max(1, end - maxVisible + 1)
                }
                for (let i = start; i <= end; i++) {
                  if (i >= 1 && i <= pages) range.push(i)
                }
                return range
              })().map(n => (
                <button key={n} onClick={() => setPage(n)} className={page === n ? 'active' : ''} style={{ width: 34, height: 34 }}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(p + 1, pages))} disabled={page === pages} style={{ width: 34, height: 34 }}>&raquo;</button>
              <button onClick={() => setPage(pages)} disabled={page === pages} style={{ width: 34, height: 34 }}>&raquo;&raquo;</button>
            </div>
          )}

          {debouncedSearch && (
            <button
              onClick={() => setSearch('')}
              style={{
                background:  'none',
                border:      'none',
                cursor:      'pointer',
                color:       'var(--gold-dark, #9A7A2E)',
                fontSize:    '0.8125rem',
                fontWeight:  500,
                textDecoration: 'underline',
              }}
            >
              Clear search
            </button>
          )}
        </div>
      </div>
    </>
  )
}