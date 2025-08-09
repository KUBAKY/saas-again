import { request } from './request'

export interface Member {
  id: string
  memberNumber: string
  name: string
  phone: string
  email?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  idCard?: string
  avatar?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  height?: number
  weight?: number
  healthNote?: string
  fitnessGoal?: string
  bodyMetrics?: Array<{
    date: string
    weight: number
    bodyFat?: number
    muscleMass?: number
    bmi?: number
    notes?: string
  }>
  wechatOpenId?: string
  wechatUnionId?: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  points: number
  lastCheckInAt?: string
  status: 'active' | 'inactive' | 'suspended' | 'expired'
  notes?: string
  preferences?: Record<string, unknown>
  storeId: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateMemberRequest {
  name: string
  phone: string
  email?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  idCard?: string
  address?: string
  emergencyContact?: string
  emergencyPhone?: string
  height?: number
  weight?: number
  healthNote?: string
  fitnessGoal?: string
  notes?: string
}

export interface UpdateMemberRequest extends Partial<CreateMemberRequest> {
  level?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  points?: number
  status?: 'active' | 'inactive' | 'suspended' | 'expired'
  preferences?: Record<string, unknown>
}

export interface QueryMemberRequest {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive' | 'suspended' | 'expired'
  level?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  gender?: 'male' | 'female' | 'other'
  storeId?: string
  minAge?: number
  maxAge?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface MemberListResponse {
  data: Member[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface MemberStatsResponse {
  total: number
  active: number
  inactive: number
  suspended: number
  expired: number
  newThisMonth: number
  expiringSoon: number
  levelDistribution: {
    bronze: number
    silver: number
    gold: number
    platinum: number
    diamond: number
  }
  genderDistribution: {
    male: number
    female: number
    other: number
  }
  ageGroups: {
    '18-25': number
    '26-35': number
    '36-45': number
    '46-55': number
    '56+': number
  }
}

export const membersApi = {
  // 获取会员列表
  getMembers: (params?: QueryMemberRequest): Promise<MemberListResponse> => {
    return request.get('/members', { params })
  },

  // 获取会员统计信息
  getMemberStats: (): Promise<MemberStatsResponse> => {
    return request.get('/members/stats')
  },

  // 获取会员详情
  getMember: (id: string): Promise<Member> => {
    return request.get(`/members/${id}`)
  },

  // 创建会员
  createMember: (data: CreateMemberRequest): Promise<Member> => {
    return request.post('/members', data)
  },

  // 更新会员信息
  updateMember: (id: string, data: UpdateMemberRequest): Promise<Member> => {
    return request.patch(`/members/${id}`, data)
  },

  // 删除会员
  deleteMember: (id: string): Promise<void> => {
    return request.delete(`/members/${id}`)
  },

  // 批量删除会员
  batchDeleteMembers: (ids: string[]): Promise<void> => {
    return request.delete('/members/batch', { data: { ids } })
  },

  // 激活会员
  activateMember: (id: string): Promise<Member> => {
    return request.patch(`/members/${id}/activate`)
  },

  // 暂停会员
  suspendMember: (id: string, reason?: string): Promise<Member> => {
    return request.patch(`/members/${id}/suspend`, { reason })
  },

  // 添加身体指标记录
  addBodyMetric: (id: string, metric: {
    weight: number
    bodyFat?: number
    muscleMass?: number
    bmi?: number
    notes?: string
  }): Promise<Member> => {
    return request.post(`/members/${id}/body-metrics`, metric)
  },

  // 获取会员签到记录
  getMemberCheckIns: (id: string, params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
  }) => {
    return request.get(`/members/${id}/checkins`, { params })
  },

  // 获取会员预约记录
  getMemberBookings: (id: string, params?: {
    page?: number
    limit?: number
    startDate?: string
    endDate?: string
    status?: string
  }) => {
    return request.get(`/members/${id}/bookings`, { params })
  },

  // 获取会员会籍卡记录
  getMemberMembershipCards: (id: string) => {
    return request.get(`/members/${id}/membership-cards`)
  },

  // 导出会员数据
  exportMembers: (params?: QueryMemberRequest): Promise<Blob> => {
    return request.get('/members/export', {
      params,
      responseType: 'blob'
    })
  },

  // 批量导入会员
  importMembers: (file: File): Promise<{
    success: number
    failed: number
    errors?: Array<{ row: number; message: string }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/members/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取会员统计图表数据
  getMemberCharts: (params: {
    type: 'registration' | 'checkin' | 'level' | 'gender' | 'age'
    startDate?: string
    endDate?: string
  }) => {
    return request.get('/members/charts', { params })
  }
}