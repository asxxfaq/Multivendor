import axios from 'axios'

const rawBaseURL = import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'production' 
      ? 'https://multivendor-api-seven.vercel.app/api' 
      : 'http://localhost:5000/api')

const api = axios.create({
  baseURL: rawBaseURL.replace(/\/+$/, ''),
})

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api