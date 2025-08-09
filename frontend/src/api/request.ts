import axios, { AxiosError } from 'axios'
import type { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  InternalAxiosRequestConfig
} from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'

// Response interface
interface ApiResponse<T = unknown> {
  success: boolean
  code: number
  message: string
  data: T
  timestamp: string
}

// Create axios instance
const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token to headers
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    
    // If the response has the standard format, return the data field
    if (data && typeof data === 'object' && 'success' in data) {
      if (data.success) {
        return { ...response, data: data.data }
      } else {
        ElMessage.error(data.message || '请求失败')
        return Promise.reject(new Error(data.message || '请求失败'))
      }
    }
    
    // For other responses, return the response directly
    return response
  },
  async (error: AxiosError<ApiResponse>) => {
    console.error('Response error:', error)
    
    const { response, request } = error
    
    // Network error
    if (!response) {
      ElMessage.error('网络连接失败，请检查网络设置')
      return Promise.reject(error)
    }
    
    const { status, data } = response
    const message = data?.message || error.message
    
    switch (status) {
      case 400:
        ElMessage.error(message || '请求参数错误')
        break
        
      case 401:
        // Token expired or invalid
        ElMessage.warning('登录已过期，请重新登录')
        
        // Try to refresh token
        const authStore = useAuthStore()
        const refreshToken = localStorage.getItem('refreshToken')
        
        if (refreshToken && !request.url?.includes('/auth/refresh')) {
          try {
            await authStore.tryRefreshToken()
            // Retry the original request
            return instance.request(request)
          } catch (refreshError) {
            // Refresh failed, redirect to login
            authStore.logout()
            window.location.href = '/login'
          }
        } else {
          // No refresh token or refresh request failed
          authStore.logout()
          window.location.href = '/login'
        }
        break
        
      case 403:
        ElMessage.error(message || '权限不足')
        break
        
      case 404:
        ElMessage.error(message || '请求的资源不存在')
        break
        
      case 409:
        ElMessage.error(message || '数据冲突')
        break
        
      case 422:
        ElMessage.error(message || '数据验证失败')
        break
        
      case 429:
        ElMessage.error('请求太频繁，请稍后再试')
        break
        
      case 500:
        ElMessage.error('服务器内部错误')
        break
        
      case 502:
      case 503:
      case 504:
        ElMessage.error('服务暂不可用，请稍后再试')
        break
        
      default:
        ElMessage.error(message || '请求失败')
        break
    }
    
    return Promise.reject(error)
  }
)

// Request methods
export const request = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instance.get(url, config)
  },
  
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return instance.post(url, data, config)
  },
  
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return instance.put(url, data, config)
  },
  
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    return instance.patch(url, data, config)
  },
  
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return instance.delete(url, config)
  },
}

export default instance