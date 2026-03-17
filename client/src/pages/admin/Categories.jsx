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

  const load = () => api.get('/admin/categories').then(r => setCategories(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

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
          <div className="dash-content-subtitle">{categories.length} product categories</div>
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
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Slug</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {categories.map(cat => (
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
      </div>
    </>
  )
}