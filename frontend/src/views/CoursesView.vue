<template>
  <div class="courses-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="title-section">
        <h1>课程管理</h1>
        <span class="subtitle">管理健身房所有课程和排课</span>
      </div>
      <div class="action-section">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增课程
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon><Reading /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.total || 0 }}</div>
                <div class="stat-label">总课程数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active">
                <el-icon><VideoPlay /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.active || 0 }}</div>
                <div class="stat-label">在售课程</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon rating">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.averageRating?.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">平均评分</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon price">
                <el-icon><Money /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">¥{{ stats.averagePrice || 0 }}</div>
                <div class="stat-label">平均价格</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input
            v-model="queryParams.search"
            placeholder="搜索课程名称、描述"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-select
            v-model="queryParams.type"
            placeholder="课程类型"
            clearable
            @change="handleSearch"
          >
            <el-option label="私教课" value="personal" />
            <el-option label="团课" value="group" />
            <el-option label="工作坊" value="workshop" />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select
            v-model="queryParams.level"
            placeholder="难度等级"
            clearable
            @change="handleSearch"
          >
            <el-option label="初级" value="beginner" />
            <el-option label="中级" value="intermediate" />
            <el-option label="高级" value="advanced" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryParams.category"
            placeholder="课程分类"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select
            v-model="queryParams.status"
            placeholder="状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="在售" value="active" />
            <el-option label="停售" value="inactive" />
            <el-option label="暂停" value="suspended" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input-number
            v-model="queryParams.minPrice"
            placeholder="最低价格"
            :min="0"
            controls-position="right"
            style="width: 48%; margin-right: 4%"
            @change="handleSearch"
          />
          <el-input-number
            v-model="queryParams.maxPrice"
            placeholder="最高价格"
            :min="0"
            controls-position="right"
            style="width: 48%"
            @change="handleSearch"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <span>课程列表 ({{ total }} 条记录)</span>
        <div class="table-actions">
          <el-button
            size="small"
            :disabled="selectedCourses.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="coursesList"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="课程信息" min-width="250">
          <template #default="{ row }">
            <div class="course-info">
              <el-image
                :src="row.coverImage"
                fit="cover"
                class="course-cover"
                :preview-src-list="[row.coverImage]"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-details">
                <div class="course-name">{{ row.name }}</div>
                <div class="course-desc">{{ row.description || '-' }}</div>
                <div class="course-tags">
                  <el-tag
                    v-for="tag in row.tags?.slice(0, 3)"
                    :key="tag"
                    size="small"
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag
              :type="getTypeColor(row.type)"
              size="small"
            >
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="难度" width="80">
          <template #default="{ row }">
            <el-tag
              :type="getLevelColor(row.level)"
              size="small"
            >
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="category" label="分类" width="100" />
        
        <el-table-column label="教练" width="120">
          <template #default="{ row }">
            <div class="coach-info">
              <el-avatar
                :size="24"
                :src="row.coach?.avatar"
                class="coach-avatar"
              >
                {{ row.coach?.name?.charAt(0) }}
              </el-avatar>
              <span class="coach-name">{{ row.coach?.name || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="时长" width="80">
          <template #default="{ row }">
            {{ row.duration }}分钟
          </template>
        </el-table-column>
        
        <el-table-column label="人数" width="80">
          <template #default="{ row }">
            {{ row.maxParticipants }}人
          </template>
        </el-table-column>
        
        <el-table-column label="价格" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="评分" width="100">
          <template #default="{ row }">
            <div class="rating-display">
              <el-rate
                :model-value="row.rating"
                disabled
                size="small"
                :max="5"
                :precision="0.1"
              />
              <span class="rating-text">{{ row.rating?.toFixed(1) || '0.0' }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="totalParticipants" label="总参与" width="80" />
        
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              size="small"
              type="info"
              link
              @click="handleViewBookings(row)"
            >
              预约
            </el-button>
            <el-button
              size="small"
              type="success"
              link
              @click="handleCopy(row)"
            >
              复制
            </el-button>
            <el-dropdown trigger="click">
              <el-button size="small" type="info" link>
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleViewDetails(row)">
                    查看详情
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleManageSchedule(row)">
                    排课管理
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'active'"
                    @click="handleSuspend(row)"
                  >
                    暂停课程
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status !== 'active'"
                    @click="handleActivate(row)"
                  >
                    启用课程
                  </el-dropdown-item>
                  <el-dropdown-item
                    divided
                    @click="handleDelete(row)"
                  >
                    删除课程
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 新增/编辑课程对话框 -->
    <CourseDialog
      v-model="dialogVisible"
      :course="currentCourse"
      :is-edit="isEdit"
      @success="handleDialogSuccess"
    />

    <!-- 课程详情对话框 -->
    <CourseDetailDialog
      v-model="detailDialogVisible"
      :course="currentCourse"
    />

    <!-- 预约管理对话框 -->
    <CourseBookingDialog
      v-model="bookingDialogVisible"
      :course="currentCourse"
    />

    <!-- 排课管理对话框 -->
    <CourseScheduleDialog
      v-model="scheduleDialogVisible"
      :course="currentCourse"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Download,
  Reading,
  VideoPlay,
  Star,
  Money,
  Search,
  Picture,
  ArrowDown
} from '@element-plus/icons-vue'
import { coursesApi, type Course, type QueryCourseRequest, type CourseStatsResponse } from '@/api/courses'
import CourseDialog from '@/components/CourseDialog.vue'
import CourseDetailDialog from '@/components/CourseDetailDialog.vue'
import CourseBookingDialog from '@/components/CourseBookingDialog.vue'
import CourseScheduleDialog from '@/components/CourseScheduleDialog.vue'

// 响应式数据
const loading = ref(false)
const coursesList = ref<Course[]>([])
const total = ref(0)
const selectedCourses = ref<Course[]>([])
const categories = ref<string[]>([])
const stats = ref<CourseStatsResponse>({
  total: 0,
  active: 0,
  inactive: 0,
  byType: {
    personal: 0,
    group: 0,
    workshop: 0
  },
  averageRating: 0,
  averagePrice: 0,
  popularCourses: []
})

// 查询参数
const queryParams = reactive<QueryCourseRequest>({
  page: 1,
  limit: 20,
  search: '',
  type: undefined,
  level: undefined,
  category: undefined,
  status: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: 'createdAt',
  sortOrder: 'DESC'
})

// 对话框状态
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const bookingDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const isEdit = ref(false)
const currentCourse = ref<Course | null>(null)

// 获取课程列表
const fetchCourses = async () => {
  try {
    loading.value = true
    const response = await coursesApi.getCourses(queryParams)
    coursesList.value = response.data
    total.value = response.meta.total
  } catch (error) {
    ElMessage.error('获取课程列表失败')
    console.error('获取课程列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const fetchStats = async () => {
  try {
    const response = await coursesApi.getCourseStats()
    stats.value = response
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 获取课程分类
const fetchCategories = async () => {
  try {
    categories.value = await coursesApi.getCategories()
  } catch (error) {
    console.error('获取课程分类失败:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  queryParams.page = 1
  fetchCourses()
}

// 选择变化处理
const handleSelectionChange = (selection: Course[]) => {
  selectedCourses.value = selection
}

// 新增课程
const handleAdd = () => {
  currentCourse.value = null
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑课程
const handleEdit = (course: Course) => {
  currentCourse.value = { ...course }
  isEdit.value = true
  dialogVisible.value = true
}

// 查看详情
const handleViewDetails = (course: Course) => {
  currentCourse.value = course
  detailDialogVisible.value = true
}

// 查看预约
const handleViewBookings = (course: Course) => {
  currentCourse.value = course
  bookingDialogVisible.value = true
}

// 排课管理
const handleManageSchedule = (course: Course) => {
  currentCourse.value = course
  scheduleDialogVisible.value = true
}

// 复制课程
const handleCopy = async (course: Course) => {
  try {
    const { value: courseName } = await ElMessageBox.prompt(
      '请输入新课程名称',
      '复制课程',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: `${course.name} - 复制`,
        inputPlaceholder: '请输入课程名称'
      }
    )
    
    await coursesApi.copyCourse(course.id, { name: courseName })
    ElMessage.success('课程复制成功')
    fetchCourses()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('复制课程失败')
    }
  }
}

// 暂停课程
const handleSuspend = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要暂停课程「${course.name}」吗？`,
      '暂停课程',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await coursesApi.updateCourseStatus(course.id, 'suspended')
    ElMessage.success('课程已暂停')
    fetchCourses()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('暂停课程失败')
    }
  }
}

// 启用课程
const handleActivate = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要启用课程「${course.name}」吗？`,
      '启用课程',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await coursesApi.updateCourseStatus(course.id, 'active')
    ElMessage.success('课程已启用')
    fetchCourses()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('启用课程失败')
    }
  }
}

// 删除课程
const handleDelete = async (course: Course) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除课程「${course.name}」吗？此操作不可撤销！`,
      '删除课程',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await coursesApi.deleteCourse(course.id)
    ElMessage.success('删除成功')
    fetchCourses()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedCourses.value.length === 0) {
    ElMessage.warning('请先选择要删除的课程')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCourses.value.length} 个课程吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedCourses.value.map(course => course.id)
    await coursesApi.batchDeleteCourses(ids)
    ElMessage.success('批量删除成功')
    selectedCourses.value = []
    fetchCourses()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出数据
const handleExport = async () => {
  try {
    const blob = await coursesApi.exportCourses(queryParams)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `courses_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 对话框成功处理
const handleDialogSuccess = () => {
  fetchCourses()
  fetchStats()
}

// 工具函数
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    personal: 'success',
    group: 'primary',
    workshop: 'warning'
  }
  return colors[type] || 'info'
}

const getTypeText = (type: string) => {
  const texts: Record<string, string> = {
    personal: '私教',
    group: '团课',
    workshop: '工作坊'
  }
  return texts[type] || '未知'
}

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger'
  }
  return colors[level] || 'info'
}

const getLevelText = (level: string) => {
  const texts: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级'
  }
  return texts[level] || '未知'
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    suspended: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: '在售',
    inactive: '停售',
    suspended: '暂停'
  }
  return texts[status] || '未知'
}

// 组件挂载
onMounted(() => {
  fetchCourses()
  fetchStats()
  fetchCategories()
})
</script>

<style scoped lang="scss">
.courses-view {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    
    .title-section {
      h1 {
        margin: 0 0 5px 0;
        font-size: 24px;
        color: #333;
        font-weight: 600;
      }
      
      .subtitle {
        color: #666;
        font-size: 14px;
      }
    }
    
    .action-section {
      display: flex;
      gap: 12px;
    }
  }

  .stats-cards {
    margin-bottom: 20px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          font-size: 24px;
          color: white;
          
          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          &.active {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }
          
          &.rating {
            background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
          }
          
          &.price {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            color: #333;
          }
        }
        
        .stat-info {
          .stat-value {
            font-size: 28px;
            font-weight: 600;
            color: #333;
            line-height: 1;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 14px;
            color: #666;
          }
        }
      }
    }
  }

  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      font-weight: 500;
      color: #333;
    }
    
    .course-info {
      display: flex;
      align-items: flex-start;
      
      .course-cover {
        width: 60px;
        height: 45px;
        border-radius: 6px;
        margin-right: 12px;
        
        .image-error {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #ccc;
          background: #f5f7fa;
          border-radius: 6px;
        }
      }
      
      .course-details {
        flex: 1;
        
        .course-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
          line-height: 1.4;
        }
        
        .course-desc {
          font-size: 12px;
          color: #666;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
        }
        
        .course-tags {
          .el-tag {
            margin-right: 4px;
            margin-bottom: 2px;
          }
        }
      }
    }
    
    .coach-info {
      display: flex;
      align-items: center;
      
      .coach-avatar {
        margin-right: 8px;
      }
      
      .coach-name {
        font-size: 12px;
        color: #333;
      }
    }
    
    .price {
      font-weight: 600;
      color: #f56c6c;
    }
    
    .rating-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .rating-text {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }
}
</style>