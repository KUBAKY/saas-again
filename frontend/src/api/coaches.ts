import { request } from './request'

export interface Coach {
  id: string
  employeeNumber: string
  name: string
  phone: string
  email?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  avatar?: string
  introduction?: string
  specialties?: string[]
  certifications?: Array<{
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
  }>
  experienceYears: number
  hourlyRate: number
  rating: number
  totalSessions: number
  status: 'active' | 'inactive' | 'suspended'
  joinDate: string
  bankAccount?: string
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
  workingHours?: {
    monday?: { start: string; end: string }
    tuesday?: { start: string; end: string }
    wednesday?: { start: string; end: string }
    thursday?: { start: string; end: string }
    friday?: { start: string; end: string }
    saturday?: { start: string; end: string }
    sunday?: { start: string; end: string }
  }
  storeId: string
  store?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateCoachRequest {
  employeeNumber: string
  name: string
  phone: string
  email?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  introduction?: string
  specialties?: string[]
  experienceYears: number
  hourlyRate: number
  joinDate: string
  bankAccount?: string
  emergencyContact?: string
  emergencyPhone?: string
  notes?: string
  storeId: string
  workingHours?: {
    monday?: { start: string; end: string }
    tuesday?: { start: string; end: string }
    wednesday?: { start: string; end: string }
    thursday?: { start: string; end: string }
    friday?: { start: string; end: string }
    saturday?: { start: string; end: string }
    sunday?: { start: string; end: string }
  }
}

export interface UpdateCoachRequest extends Partial<CreateCoachRequest> {
  status?: 'active' | 'inactive' | 'suspended'
  rating?: number
  totalSessions?: number
}

export interface QueryCoachRequest {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'suspended'
  gender?: 'male' | 'female' | 'other'
  specialty?: string
  storeId?: string
  minExperience?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CoachListResponse {
  data: Coach[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CoachStatsResponse {
  totalCoaches: number
  activeCoaches: number
  inactiveCoaches: number
  averageExperience: number
  coachesBySpecialty: Record<string, number>
  averageRating: number
  topCoaches: Array<{
    id: string
    name: string
    rating: number
    totalSessions: number
  }>
}

export interface CoachSchedule {
  date: string
  timeSlots: Array<{
    startTime: string
    endTime: string
    isBooked: boolean
    booking?: {
      id: string
      member: {
        id: string
        name: string
      }
      course: {
        id: string
        name: string
      }
    }
  }>
}

export interface CoachEarnings {
  totalEarnings: number
  currentMonthEarnings: number
  sessions: Array<{
    date: string
    course: string
    member: string
    earnings: number
    commission: number
  }>
  monthlyStats: Array<{
    month: string
    earnings: number
    sessions: number
  }>
}

export const coachesApi = {
  // 获取教练列表
  getCoaches: (params?: QueryCoachRequest): Promise<CoachListResponse> => {
    return request.get('/coaches', { params })
  },

  // 获取教练统计信息
  getCoachStats: (): Promise<CoachStatsResponse> => {
    return request.get('/coaches/stats')
  },

  // 获取教练详情
  getCoach: (id: string): Promise<Coach> => {
    return request.get(`/coaches/${id}`)
  },

  // 创建教练
  createCoach: (data: CreateCoachRequest): Promise<Coach> => {
    return request.post('/coaches', data)
  },

  // 更新教练信息
  updateCoach: (id: string, data: UpdateCoachRequest): Promise<Coach> => {
    return request.patch(`/coaches/${id}`, data)
  },

  // 删除教练
  deleteCoach: (id: string): Promise<void> => {
    return request.delete(`/coaches/${id}`)
  },

  // 批量删除教练
  batchDeleteCoaches: (ids: string[]): Promise<void> => {
    return request.delete('/coaches/batch', { data: { ids } })
  },

  // 激活教练
  activateCoach: (id: string): Promise<Coach> => {
    return request.patch(`/coaches/${id}/activate`)
  },

  // 暂停教练
  suspendCoach: (id: string, reason?: string): Promise<Coach> => {
    return request.patch(`/coaches/${id}/suspend`, { reason })
  },

  // 获取教练排班
  getCoachSchedule: (id: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<CoachSchedule[]> => {
    return request.get(`/coaches/${id}/schedule`, { params })
  },

  // 更新教练工作时间
  updateWorkingHours: (id: string, workingHours: Coach['workingHours']): Promise<Coach> => {
    return request.patch(`/coaches/${id}/working-hours`, { workingHours })
  },

  // 获取教练预约记录
  getCoachBookings: (id: string, params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    status?: string
  }) => {
    return request.get(`/coaches/${id}/bookings`, { params })
  },

  // 获取教练收入统计
  getCoachEarnings: (id: string, params?: {
    startDate?: string
    endDate?: string
  }): Promise<CoachEarnings> => {
    return request.get(`/coaches/${id}/earnings`, { params })
  },

  // 获取教练评价
  getCoachReviews: (id: string, params?: {
    page?: number
    limit?: number
  }) => {
    return request.get(`/coaches/${id}/reviews`, { params })
  },

  // 上传教练头像
  uploadAvatar: (id: string, file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    return request.post(`/coaches/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 添加资质认证
  addCertification: (id: string, certification: {
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
  }): Promise<Coach> => {
    return request.post(`/coaches/${id}/certifications`, certification)
  },

  // 删除资质认证
  removeCertification: (id: string, certificationId: string): Promise<Coach> => {
    return request.delete(`/coaches/${id}/certifications/${certificationId}`)
  },

  // 导出教练数据
  exportCoaches: (params?: QueryCoachRequest): Promise<Blob> => {
    return request.get('/coaches/export', {
      params,
      responseType: 'blob'
    })
  },

  // 批量导入教练
  importCoaches: (file: File): Promise<{
    success: number
    failed: number
    errors?: Array<{ row: number; message: string }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/coaches/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取专业列表（用于筛选）
  getSpecialties: (): Promise<string[]> => {
    return request.get('/coaches/specialties')
  },

  // 获取教练图表数据
  getCoachCharts: (params: {
    type: 'performance' | 'earnings' | 'rating' | 'specialty'
    startDate?: string
    endDate?: string
  }) => {
    return request.get('/coaches/charts', { params })
  }
}