<template>
  <div class="coaches-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="title-section">
        <h1>教练管理</h1>
        <span class="subtitle">管理健身房教练信息和排班</span>
      </div>
      <div class="action-section">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增教练
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
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalCoaches || 0 }}</div>
                <div class="stat-label">总教练数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon active">
                <el-icon><UserFilled /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.activeCoaches || 0 }}</div>
                <div class="stat-label">在职教练</div>
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
              <div class="stat-icon experience">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.averageExperience || 0 }} 年</div>
                <div class="stat-label">平均经验</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            v-model="queryParams.search"
            placeholder="搜索教练姓名、手机号"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryParams.status"
            placeholder="状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="在职" value="active" />
            <el-option label="离职" value="inactive" />
            <el-option label="暂停" value="suspended" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryParams.gender"
            placeholder="性别"
            clearable
            @change="handleSearch"
          >
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select
            v-model="queryParams.specialty"
            placeholder="专业领域"
            clearable
            @change="handleSearch"
          >
            <el-option
              v-for="specialty in specialties"
              :key="specialty"
              :label="specialty"
              :value="specialty"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input-number
            v-model="queryParams.minExperience"
            placeholder="最少经验年数"
            :min="0"
            :max="50"
            controls-position="right"
            @change="handleSearch"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <div class="table-header">
        <span>教练列表 ({{ total }} 条记录)</span>
        <div class="table-actions">
          <el-button
            size="small"
            :disabled="selectedCoaches.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>
      
      <el-table
        v-loading="loading"
        :data="coachesList"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column label="教练信息" min-width="200">
          <template #default="{ row }">
            <div class="coach-info">
              <el-avatar
                :size="40"
                :src="row.avatar"
                :alt="row.name"
                class="coach-avatar"
              >
                {{ row.name.charAt(0) }}
              </el-avatar>
              <div class="coach-details">
                <div class="coach-name">{{ row.name }}</div>
                <div class="coach-phone">{{ row.phone }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="employeeNumber" label="工号" width="120" />
        
        <el-table-column label="专业领域" width="150">
          <template #default="{ row }">
            <div v-if="row.specialties?.length">
              <el-tag
                v-for="specialty in row.specialties.slice(0, 2)"
                :key="specialty"
                size="small"
                type="info"
                class="specialty-tag"
              >
                {{ specialty }}
              </el-tag>
              <span v-if="row.specialties.length > 2" class="more-specialties">
                +{{ row.specialties.length - 2 }}
              </span>
            </div>
            <span v-else class="no-data">-</span>
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
        
        <el-table-column prop="experienceYears" label="经验" width="80">
          <template #default="{ row }">
            {{ row.experienceYears }} 年
          </template>
        </el-table-column>
        
        <el-table-column label="课时费" width="100">
          <template #default="{ row }">
            ¥{{ row.hourlyRate }}/时
          </template>
        </el-table-column>
        
        <el-table-column prop="totalSessions" label="总课时" width="80" />
        
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
        
        <el-table-column label="入职时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.joinDate) }}
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
              @click="handleViewSchedule(row)"
            >
              排班
            </el-button>
            <el-button
              size="small"
              type="success"
              link
              @click="handleViewEarnings(row)"
            >
              收入
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
                  <el-dropdown-item
                    v-if="row.status === 'active'"
                    @click="handleSuspend(row)"
                  >
                    暂停工作
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="row.status === 'suspended'"
                    @click="handleActivate(row)"
                  >
                    恢复工作
                  </el-dropdown-item>
                  <el-dropdown-item
                    divided
                    @click="handleDelete(row)"
                  >
                    删除教练
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

    <!-- 新增/编辑教练对话框 -->
    <CoachDialog
      v-model="dialogVisible"
      :coach="currentCoach"
      :is-edit="isEdit"
      @success="handleDialogSuccess"
    />

    <!-- 教练详情对话框 -->
    <CoachDetailDialog
      v-model="detailDialogVisible"
      :coach="currentCoach"
    />

    <!-- 排班管理对话框 -->
    <CoachScheduleDialog
      v-model="scheduleDialogVisible"
      :coach="currentCoach"
    />

    <!-- 收入统计对话框 -->
    <CoachEarningsDialog
      v-model="earningsDialogVisible"
      :coach="currentCoach"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Download,
  User,
  UserFilled,
  Star,
  Trophy,
  Search,
  ArrowDown
} from '@element-plus/icons-vue'
import { coachesApi, type Coach, type QueryCoachRequest, type CoachStatsResponse } from '@/api/coaches'
import CoachDialog from '@/components/CoachDialog.vue'
import CoachDetailDialog from '@/components/CoachDetailDialog.vue'
import CoachScheduleDialog from '@/components/CoachScheduleDialog.vue'
import CoachEarningsDialog from '@/components/CoachEarningsDialog.vue'

// 响应式数据
const loading = ref(false)
const coachesList = ref<Coach[]>([])
const total = ref(0)
const selectedCoaches = ref<Coach[]>([])
const specialties = ref<string[]>([])
const stats = ref<CoachStatsResponse>({
  totalCoaches: 0,
  activeCoaches: 0,
  inactiveCoaches: 0,
  averageExperience: 0,
  coachesBySpecialty: {},
  averageRating: 0,
  topCoaches: []
})

// 查询参数
const queryParams = reactive<QueryCoachRequest>({
  page: 1,
  limit: 20,
  search: '',
  status: undefined,
  gender: undefined,
  specialty: undefined,
  minExperience: undefined,
  sortBy: 'createdAt',
  sortOrder: 'DESC'
})

// 对话框状态
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const scheduleDialogVisible = ref(false)
const earningsDialogVisible = ref(false)
const isEdit = ref(false)
const currentCoach = ref<Coach | null>(null)

// 获取教练列表
const fetchCoaches = async () => {
  try {
    loading.value = true
    const response = await coachesApi.getCoaches(queryParams)
    coachesList.value = response.data
    total.value = response.total
  } catch (error) {
    ElMessage.error('获取教练列表失败')
    console.error('获取教练列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取统计信息
const fetchStats = async () => {
  try {
    const response = await coachesApi.getCoachStats()
    stats.value = response
  } catch (error) {
    console.error('获取统计信息失败:', error)
  }
}

// 获取专业列表
const fetchSpecialties = async () => {
  try {
    specialties.value = await coachesApi.getSpecialties()
  } catch (error) {
    console.error('获取专业列表失败:', error)
  }
}

// 搜索处理
const handleSearch = () => {
  queryParams.page = 1
  fetchCoaches()
}

// 选择变化处理
const handleSelectionChange = (selection: Coach[]) => {
  selectedCoaches.value = selection
}

// 新增教练
const handleAdd = () => {
  currentCoach.value = null
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑教练
const handleEdit = (coach: Coach) => {
  currentCoach.value = { ...coach }
  isEdit.value = true
  dialogVisible.value = true
}

// 查看详情
const handleViewDetails = (coach: Coach) => {
  currentCoach.value = coach
  detailDialogVisible.value = true
}

// 查看排班
const handleViewSchedule = (coach: Coach) => {
  currentCoach.value = coach
  scheduleDialogVisible.value = true
}

// 查看收入
const handleViewEarnings = (coach: Coach) => {
  currentCoach.value = coach
  earningsDialogVisible.value = true
}

// 暂停教练
const handleSuspend = async (coach: Coach) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入暂停原因',
      '暂停教练工作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入暂停原因'
      }
    )
    
    await coachesApi.suspendCoach(coach.id, reason)
    ElMessage.success('教练已暂停工作')
    fetchCoaches()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('暂停教练失败')
    }
  }
}

// 激活教练
const handleActivate = async (coach: Coach) => {
  try {
    await ElMessageBox.confirm(
      `确定要恢复教练 ${coach.name} 的工作吗？`,
      '恢复教练工作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await coachesApi.activateCoach(coach.id)
    ElMessage.success('教练工作已恢复')
    fetchCoaches()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('恢复教练工作失败')
    }
  }
}

// 删除教练
const handleDelete = async (coach: Coach) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教练 ${coach.name} 吗？此操作不可撤销！`,
      '删除教练',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await coachesApi.deleteCoach(coach.id)
    ElMessage.success('删除成功')
    fetchCoaches()
    fetchStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedCoaches.value.length === 0) {
    ElMessage.warning('请先选择要删除的教练')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCoaches.value.length} 个教练吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedCoaches.value.map(coach => coach.id)
    await coachesApi.batchDeleteCoaches(ids)
    ElMessage.success('批量删除成功')
    selectedCoaches.value = []
    fetchCoaches()
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
    const blob = await coachesApi.exportCoaches(queryParams)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `coaches_${new Date().toISOString().slice(0, 10)}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// 对话框成功处理
const handleDialogSuccess = () => {
  fetchCoaches()
  fetchStats()
}

// 工具函数
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
    active: '在职',
    inactive: '离职',
    suspended: '暂停'
  }
  return texts[status] || '未知'
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 组件挂载
onMounted(() => {
  fetchCoaches()
  fetchStats()
  fetchSpecialties()
})
</script>

<style scoped lang="scss">
.coaches-view {
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
          
          &.experience {
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
    
    .coach-info {
      display: flex;
      align-items: center;
      
      .coach-avatar {
        margin-right: 12px;
      }
      
      .coach-details {
        .coach-name {
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }
        
        .coach-phone {
          font-size: 12px;
          color: #666;
        }
      }
    }
    
    .specialty-tag {
      margin-right: 4px;
      margin-bottom: 4px;
    }
    
    .more-specialties {
      font-size: 12px;
      color: #999;
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
    
    .no-data {
      color: #ccc;
    }
    
    .pagination-wrapper {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
  }
}
</style>