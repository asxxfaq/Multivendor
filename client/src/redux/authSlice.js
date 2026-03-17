// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axiosInstance'

const stored = JSON.parse(localStorage.getItem('user') || 'null')

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds)
    localStorage.setItem('user', JSON.stringify(data))
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (body, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', body)
    localStorage.setItem('user', JSON.stringify(data))
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const getMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:    stored,
    loading: false,
    error:   null,
  },
  reducers: {
    // ✅ added setUser
    setUser(state, action) {
      state.user  = action.payload
      state.error = null
      localStorage.setItem('user', JSON.stringify(action.payload))
    },
    logout(state) {
      state.user  = null
      state.error = null
      localStorage.removeItem('user')
    },
    clearError(state) {
      state.error = null
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
  extraReducers: (builder) => {
    const pending  = (s)    => { s.loading = true;  s.error = null }
    const rejected = (s, a) => { s.loading = false; s.error = a.payload }
    builder
      .addCase(loginUser.pending,      pending)
      .addCase(loginUser.rejected,     rejected)
      .addCase(loginUser.fulfilled,    (s, a) => { s.loading = false; s.user = a.payload })
      .addCase(registerUser.pending,   pending)
      .addCase(registerUser.rejected,  rejected)
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload })
      .addCase(getMe.fulfilled,        (s, a) => { s.user = { ...s.user, ...a.payload } })
  },
})

// ✅ setUser added to exports
export const { setUser, logout, clearError, updateUser } = authSlice.actions
export default authSlice.reducer