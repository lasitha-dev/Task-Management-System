import axios from 'axios'

// Axios instance — all API calls go through here
const api = axios.create({
  baseURL: '/',
})

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized — token may be expired.')
    }
    return Promise.reject(error)
  }
)

export default api
