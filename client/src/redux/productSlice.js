// src/redux/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axiosInstance'

export const fetchProducts = createAsyncThunk('products/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const { category, sort, page, q, minPrice, maxPrice } = params

    const query = new URLSearchParams()
    if (category && category.trim()) query.set('category', category.trim())
    if (sort     && sort.trim())     query.set('sort',     sort.trim())
    else                             query.set('sort',     'newest')   // ✅ default sort
    if (page)                        query.set('page',     page)
    else                             query.set('page',     '1')        // ✅ default page
    if (q        && q.trim())        query.set('q',        q.trim())
    if (minPrice && minPrice !== '') query.set('minPrice', minPrice)
    if (maxPrice && maxPrice !== '') query.set('maxPrice', maxPrice)

    const { data } = await api.get(`/products?${query.toString()}`)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch products')
  }
})

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch product')
  }
})

export const fetchFeatured = createAsyncThunk('products/featured', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/featured')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch featured')
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState: {
    list:     [],
    total:    0,
    pages:    1,
    current:  null,
    featured: [],
    loading:  false,
    error:    null,
  },
  reducers: {
    clearCurrent(state) { state.current = null },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchProducts ──────────────────────
      .addCase(fetchProducts.pending,   (s) => { s.loading = true;  s.error = null })
      .addCase(fetchProducts.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false
        s.list    = a.payload.products || []
        s.total   = a.payload.total    || 0
        s.pages   = a.payload.pages    || 1
      })
      // ── fetchProduct ───────────────────────
      .addCase(fetchProduct.pending,   (s) => { s.loading = true;  s.error = null })
      .addCase(fetchProduct.rejected,  (s, a) => { s.loading = false; s.error = a.payload })
      .addCase(fetchProduct.fulfilled, (s, a) => { s.loading = false; s.current = a.payload })
      // ── fetchFeatured ──────────────────────
      .addCase(fetchFeatured.pending,   (s) => { s.loading = false })
      .addCase(fetchFeatured.fulfilled, (s, a) => { s.featured = a.payload || [] })
      .addCase(fetchFeatured.rejected,  (s) => { s.featured = [] })
  },
})

export const { clearCurrent } = productSlice.actions
export default productSlice.reducer