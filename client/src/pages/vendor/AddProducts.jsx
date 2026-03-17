import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/axiosInstance'
import { toast } from 'react-toastify'

export default function AddProduct() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = !!id

  const [form, setForm] = useState({
    name:         '',
    description:  '',
    price:        '',
    comparePrice: '',
    stock:        '',
    category:     '',
    tags:         '',
  })
  const [images, setImages]         = useState([])
  const [previews, setPreviews]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    // Load categories
    api.get('/admin/categories')
      .then(r => setCategories(r.data))
      .catch(() => toast.error('Failed to load categories'))

    // Load product if editing
    if (isEdit) {
      api.get(`/products/${id}`)
        .then(r => {
          const p = r.data
          setForm({
            name:         p.name              || '',
            description:  p.description       || '',
            price:        p.price             || '',
            comparePrice: p.comparePrice      || '',
            stock:        p.stock             || '',
            category:     p.category?._id     || '',
            tags:         p.tags?.join(', ')  || '',
          })
          setPreviews(p.images || [])
        })
        .catch(() => toast.error('Failed to load product'))
    }
  }, [id])

  const setF = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    setImages(files)
    setPreviews(files.map(f => URL.createObjectURL(f)))
  }

  const removePreview = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // ── Validate ──────────────────────────────
    if (!form.name.trim())
      return toast.error('Product name is required')

    if (!form.price || Number(form.price) <= 0)
      return toast.error('Please enter a valid price')

    if (!form.stock && form.stock !== 0)
      return toast.error('Please enter stock quantity')

    if (!form.category || form.category === '')
      return toast.error('Please select a category')

    if (!isEdit && images.length === 0)
      return toast.error('Please upload at least one image')

    setLoading(true)

    try {
      const fd = new FormData()

      // ✅ Append only non-empty fields individually
      fd.append('name',        form.name.trim())
      fd.append('description', form.description.trim())
      fd.append('price',       form.price)
      fd.append('stock',       form.stock || 0)
      fd.append('category',    form.category)   // ✅ only appended after validation

      // Optional fields
      if (form.comparePrice) fd.append('comparePrice', form.comparePrice)
      if (form.tags.trim())  fd.append('tags', form.tags.trim())

      // ✅ Append images
      images.forEach(img => fd.append('images', img))

      if (isEdit) {
        await api.put(`/products/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Product updated successfully!')
      } else {
        await api.post('/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Product added successfully!')
      }

      navigate('/vendor/products')

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="dash-content-header">
        <div>
          <div className="dash-content-title">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </div>
          <div className="dash-content-subtitle">
            {isEdit ? 'Update your product details' : 'Fill in the details to list a new product'}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate('/vendor/products')}
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="product-form-layout">

          {/* ── Main Info ── */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h3>Basic Information</h3></div>
              <div className="card-body">

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={setF('name')}
                    required
                    placeholder="e.g. Premium Cotton Slim Fit Shirt"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-textarea"
                    value={form.description}
                    onChange={setF('description')}
                    required
                    style={{ minHeight: 120 }}
                    placeholder="Describe your product in detail..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Selling Price (₹) *</label>
                    <input
                      className="form-input"
                      type="number"
                      value={form.price}
                      onChange={setF('price')}
                      required
                      min={1}
                      placeholder="999"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">MRP / Compare Price (₹)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={form.comparePrice}
                      onChange={setF('comparePrice')}
                      min={0}
                      placeholder="1499"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Stock Quantity *</label>
                    <input
                      className="form-input"
                      type="number"
                      value={form.stock}
                      onChange={setF('stock')}
                      required
                      min={0}
                      placeholder="50"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      className="form-select"
                      value={form.category}
                      onChange={setF('category')}
                      required
                    >
                      <option value="">-- Select a category --</option>
                      {categories.length === 0 ? (
                        <option disabled>No categories found</option>
                      ) : (
                        categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))
                      )}
                    </select>
                    {/* Show message if no categories */}
                    {categories.length === 0 && (
                      <p className="form-hint">
                        No categories yet. Ask admin to add categories first.
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    className="form-input"
                    value={form.tags}
                    onChange={setF('tags')}
                    placeholder="cotton, slim-fit, casual"
                  />
                  <p className="form-hint">Tags help customers find your product</p>
                </div>

              </div>
            </div>
          </div>

          {/* ── Side: Images ── */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <h3>Product Images</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                  {images.length}/5
                </span>
              </div>
              <div className="card-body">
                <label className="image-upload-zone">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImages}
                  />
                  <div className="upload-icon-big">📷</div>
                  <div className="upload-main-text">Click to upload images</div>
                  <div className="upload-sub-text">
                    JPG, PNG, WebP · Max 5MB each · Up to 5 images
                  </div>
                </label>

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="preview-grid">
                    {previews.map((src, i) => (
                      <div key={i} className="preview-item">
                        <img src={src} alt={`Preview ${i + 1}`} />
                        <button
                          type="button"
                          className="preview-remove"
                          onClick={() => removePreview(i)}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {!isEdit && images.length === 0 && (
                  <p className="form-hint" style={{ marginTop: 8, textAlign: 'center' }}>
                    At least 1 image is required
                  </p>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary btn-full btn-lg"
              type="submit"
              disabled={loading || categories.length === 0}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  Saving…
                </span>
              ) : isEdit ? 'Update Product' : 'Add Product'}
            </button>

            {categories.length === 0 && (
              <p className="form-error" style={{ textAlign: 'center', marginTop: 8 }}>
                Add categories from admin panel first
              </p>
            )}
          </div>

        </div>
      </form>
    </>
  )
}