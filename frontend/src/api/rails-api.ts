import axios from 'axios'
import { ensureCsrfToken, getCsrfToken } from './csrf'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true, // Cookie セッション送信
})

const UNSAFE_METHODS = new Set([ 'post', 'put', 'patch', 'delete' ])

apiClient.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()

  if (method && UNSAFE_METHODS.has(method)) {
    const token = getCsrfToken() ?? await ensureCsrfToken()
    config.headers['X-CSRF-Token'] = token
  }

  return config
})

export default apiClient
