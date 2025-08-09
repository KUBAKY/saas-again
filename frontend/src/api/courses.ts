import { request } from './request'

export interface Course {
  id: string
  name: string
  description?: string
  type: 'personal' | 'group' | 'workshop'
  level: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  duration: number // 分钟
  maxParticipants: number
  price: number
  rating: number
  totalParticipants: number
  totalSessions: number
  status: 'active' | 'inactive' | 'suspended'
  coverImage?: string
  images?: string[]
  tags?: string[]
  requirements?: string
  benefits?: string
  equipment?: string[]
  coachId: string
  storeId: string
  coach?: {
    id: string
    name: string
    avatar?: string
  }
  store?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateCourseRequest {
  name: string
  description?: string
  type: 'personal' | 'group' | 'workshop'
  level: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  duration: number
  maxParticipants: number
  price: number
  tags?: string[]
  requirements?: string
  benefits?: string
  equipment?: string[]
  coachId: string
  storeId: string
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  status?: 'active' | 'inactive' | 'suspended'
}

export interface QueryCourseRequest {
  page?: number
  limit?: number
  search?: string
  type?: 'personal' | 'group' | 'workshop'
  level?: 'beginner' | 'intermediate' | 'advanced'
  category?: string
  status?: 'active' | 'inactive' | 'suspended'
  storeId?: string
  coachId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CourseListResponse {
  data: Course[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CourseStatsResponse {
  total: number
  active: number
  inactive: number
  byType: {
    personal: number
    group: number
    workshop: number
  }
  averageRating: number
  averagePrice: number
  popularCourses: Array<{
    id: string
    name: string
    rating: number
    totalParticipants: number
  }>
}

export interface CourseBooking {
  id: string
  bookingNumber: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  member: {
    id: string
    name: string
    phone: string
  }
  createdAt: string
}

export const coursesApi = {
  // 获取课程列表
  getCourses: (params?: QueryCourseRequest): Promise<CourseListResponse> => {
    return request.get('/courses', { params })
  },

  // 获取课程统计信息
  getCourseStats: (): Promise<CourseStatsResponse> => {
    return request.get('/courses/stats')
  },

  // 获取热门课程
  getPopularCourses: (limit = 10): Promise<Course[]> => {
    return request.get('/courses/popular', { params: { limit } })
  },

  // 获取课程详情
  getCourse: (id: string): Promise<Course> => {
    return request.get(`/courses/${id}`)
  },

  // 创建课程
  createCourse: (data: CreateCourseRequest): Promise<Course> => {
    return request.post('/courses', data)
  },

  // 更新课程信息
  updateCourse: (id: string, data: UpdateCourseRequest): Promise<Course> => {
    return request.patch(`/courses/${id}`, data)
  },

  // 更新课程状态
  updateCourseStatus: (id: string, status: 'active' | 'inactive' | 'suspended'): Promise<Course> => {
    return request.patch(`/courses/${id}/status`, { status })
  },

  // 删除课程
  deleteCourse: (id: string): Promise<void> => {
    return request.delete(`/courses/${id}`)
  },

  // 批量删除课程
  batchDeleteCourses: (ids: string[]): Promise<void> => {
    return request.delete('/courses/batch', { data: { ids } })
  },

  // 获取课程预约记录
  getCourseBookings: (id: string, params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
  }): Promise<{
    data: CourseBooking[]
    meta: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> => {
    return request.get(`/courses/${id}/bookings`, { params })
  },

  // 获取课程评价
  getCourseReviews: (id: string, params?: {
    page?: number
    limit?: number
  }) => {
    return request.get(`/courses/${id}/reviews`, { params })
  },

  // 上传课程封面图片
  uploadCoverImage: (id: string, file: File): Promise<{ coverImageUrl: string }> => {
    const formData = new FormData()
    formData.append('coverImage', file)
    return request.post(`/courses/${id}/cover-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 上传课程图片
  uploadImages: (id: string, files: File[]): Promise<{ imageUrls: string[] }> => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`images[${index}]`, file)
    })
    return request.post(`/courses/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 复制课程
  copyCourse: (id: string, data: {
    name: string
    coachId?: string
    storeId?: string
  }): Promise<Course> => {
    return request.post(`/courses/${id}/copy`, data)
  },

  // 导出课程数据
  exportCourses: (params?: QueryCourseRequest): Promise<Blob> => {
    return request.get('/courses/export', {
      params,
      responseType: 'blob'
    })
  },

  // 批量导入课程
  importCourses: (file: File): Promise<{
    success: number
    failed: number
    errors?: Array<{ row: number; message: string }>
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/courses/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取课程分类列表
  getCategories: (): Promise<string[]> => {
    return request.get('/courses/categories')
  },

  // 获取课程标签列表
  getTags: (): Promise<string[]> => {
    return request.get('/courses/tags')
  },

  // 获取课程图表数据
  getCourseCharts: (params: {
    type: 'booking' | 'rating' | 'revenue' | 'popularity'
    startDate?: string
    endDate?: string
  }) => {
    return request.get('/courses/charts', { params })
  },

  // 课程排班
  getCourseSchedule: (id: string, params?: {
    startDate?: string
    endDate?: string
  }) => {
    return request.get(`/courses/${id}/schedule`, { params })
  },

  // 更新课程排班
  updateCourseSchedule: (id: string, schedule: Array<{
    dayOfWeek: number // 0-6, 0是周日
    startTime: string
    endTime: string
    maxParticipants: number
  }>) => {
    return request.post(`/courses/${id}/schedule`, { schedule })
  }
}