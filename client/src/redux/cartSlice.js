// src/redux/cartSlice.js
import { createSlice } from '@reduxjs/toolkit'

const stored = JSON.parse(localStorage.getItem('cart') || '[]')

const persist = (items) => localStorage.setItem('cart', JSON.stringify(items))

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: stored },
  reducers: {
    addToCart(state, { payload }) {
      const idx = state.items.findIndex(
        (i) => i._id === payload._id && i.selectedSize === payload.selectedSize && i.selectedColor === payload.selectedColor
      )
      if (idx > -1) state.items[idx].quantity += payload.quantity || 1
      else          state.items.push({ ...payload, quantity: payload.quantity || 1 })
      persist(state.items)
    },
    removeFromCart(state, { payload }) {
      state.items = state.items.filter((i) => i._id !== payload)
      persist(state.items)
    },
    updateQuantity(state, { payload: { id, quantity } }) {
      const item = state.items.find((i) => i._id === id)
      if (item) item.quantity = Math.max(1, quantity)
      persist(state.items)
    },
    clearCart(state) {
      state.items = []
      localStorage.removeItem('cart')
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

// Selectors
export const selectCartCount  = (state) => state.cart.items.reduce((s, i) => s + i.quantity, 0)
export const selectCartTotal  = (state) => state.cart.items.reduce((s, i) => s + i.price * i.quantity, 0)
export const selectCartItems  = (state) => state.cart.items

export default cartSlice.reducer