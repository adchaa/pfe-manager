import axios from "axios"

const API_URL = "/api"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
        const { token, user } = response.data

        localStorage.setItem("token", token)
        localStorage.setItem("user", JSON.stringify(user))

        api.defaults.headers.common["Authorization"] = `Bearer ${token}`
        originalRequest.headers["Authorization"] = `Bearer ${token}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default api
