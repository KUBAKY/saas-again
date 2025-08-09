import { request } from './request'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  realName: string
  phone?: string
  brandId?: string
  storeId?: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    username: string
    email: string
    realName: string
    phone?: string
    brandId?: string
    storeId?: string
    roles: string[]
    permissions: string[]
    lastLoginAt?: string
  }
}

export interface UpdateProfileRequest {
  realName?: string
  phone?: string
  email?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const authApi = {
  // 用户登录
  login: (data: LoginRequest): Promise<AuthResponse> => {
    return request.post('/auth/login', data)
  },

  // 用户注册
  register: (data: RegisterRequest): Promise<AuthResponse> => {
    return request.post('/auth/register', data)
  },

  // 刷新Token
  refreshToken: (refreshToken: string): Promise<{ access_token: string }> => {
    return request.post('/auth/refresh', { refresh_token: refreshToken })
  },

  // 获取当前用户信息
  getProfile: () => {
    return request.get('/auth/profile')
  },

  // 更新用户资料
  updateProfile: (data: UpdateProfileRequest) => {
    return request.put('/auth/profile', data)
  },

  // 修改密码
  changePassword: (data: ChangePasswordRequest) => {
    return request.patch('/auth/change-password', data)
  },

  // 退出登录 (可选，如果后端提供接口)
  logout: () => {
    return request.post('/auth/logout')
  },
}