<template>
  <div class="members-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">会员管理</h1>
        <p class="page-description">管理健身房会员信息和会籍卡状态</p>
      </div>
      <div class="header-right">
        <el-button type="primary" size="large" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新增会员
        </el-button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon primary">
            <el-icon><User /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ memberStats.total || 0 }}</div>
            <div class="stats-label">总会员数</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon success">
            <el-icon><Check /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ memberStats.active || 0 }}</div>
            <div class="stats-label">活跃会员</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon warning">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ memberStats.expiringSoon || 0 }}</div>
            <div class="stats-label">即将到期</div>
          </div>
        </div>
      </el-card>
      
      <el-card class="stats-card">
        <div class="stats-item">
          <div class="stats-icon info">
            <el-icon><UserFilled /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-number">{{ memberStats.newThisMonth || 0 }}</div>
            <div class="stats-label">本月新增</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Search and Filter -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="姓名/手机号/会员号"
            clearable
            style="width: 200px"
            @change="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="活跃" value="active" />
            <el-option label="暂停" value="inactive" />
            <el-option label="已暂停" value="suspended" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="等级">
          <el-select
            v-model="searchForm.level"
            placeholder="全部等级"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="铜牌" value="bronze" />
            <el-option label="银牌" value="silver" />
            <el-option label="金牌" value="gold" />
            <el-option label="白金" value="platinum" />
            <el-option label="钻石" value="diamond" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="性别">
          <el-select
            v-model="searchForm.gender"
            placeholder="全部性别"
            clearable
            style="width: 100px"
            @change="handleSearch"
          >
            <el-option label="男" value="male" />
            <el-option label="女" value="female" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Members Table -->
    <el-card class="table-card">
      <el-table
        v-loading="tableLoading"
        :data="membersList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="memberNumber" label="会员号" width="120" />
        
        <el-table-column prop="name" label="姓名" width="100" />
        
        <el-table-column prop="phone" label="手机号" width="130" />
        
        <el-table-column label="性别" width="60">
          <template #default="{ row }">
            <span v-if="row.gender === 'male'">男</span>
            <span v-else-if="row.gender === 'female'">女</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <el-table-column label="年龄" width="60">
          <template #default="{ row }">
            {{ row.birthday ? getAge(row.birthday) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="等级" width="80">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)">
              {{ getLevelName(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="points" label="积分" width="80" />
        
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="最后签到" width="110">
          <template #default="{ row }">
            {{ row.lastCheckInAt ? formatDate(row.lastCheckInAt) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="创建时间" width="110">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewMember(row)">详情</el-button>
            <el-button size="small" type="primary" @click="editMember(row)">编辑</el-button>
            <el-dropdown @command="(command) => handleMemberAction(command, row)">
              <el-button size="small">
                更多<el-icon><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="suspend">暂停</el-dropdown-item>
                  <el-dropdown-item command="activate">激活</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- Pagination -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :small="false"
          :disabled="tableLoading"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Create Member Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      title="新增会员"
      width="600px"
      :before-close="handleCloseCreateDialog"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="80px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="createForm.name" placeholder="请输入会员姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="createForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="createForm.gender" placeholder="请选择性别">
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="createForm.birthday"
                type="date"
                placeholder="请选择生日"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createForm.email" placeholder="请输入邮箱（可选）" />
        </el-form-item>
        
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="createForm.idCard" placeholder="请输入身份证号（可选）" />
        </el-form-item>
        
        <el-form-item label="地址" prop="address">
          <el-input
            v-model="createForm.address"
            type="textarea"
            placeholder="请输入地址（可选）"
            :rows="2"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleCreateMember">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import {
  Plus,
  User,
  Check,
  Clock,
  UserFilled,
  Search,
  Refresh,
  ArrowDown,
} from '@element-plus/icons-vue'

// Types
interface Member {
  id: string
  memberNumber: string
  name: string
  phone: string
  email?: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  idCard?: string
  address?: string
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  points: number
  status: 'active' | 'inactive' | 'suspended' | 'expired'
  lastCheckInAt?: string
  createdAt: string
  updatedAt: string
}

interface MemberStats {
  total: number
  active: number
  expiringSoon: number
  newThisMonth: number
}

// State
const tableLoading = ref(false)
const submitLoading = ref(false)
const membersList = ref<Member[]>([])
const memberStats = ref<MemberStats>({
  total: 0,
  active: 0,
  expiringSoon: 0,
  newThisMonth: 0,
})

const selectedMembers = ref<Member[]>([])
const showCreateDialog = ref(false)

// Forms
const createFormRef = ref<FormInstance>()
const searchForm = reactive({
  search: '',
  status: '',
  level: '',
  gender: '',
})

const createForm = reactive({
  name: '',
  phone: '',
  email: '',
  gender: '',
  birthday: null,
  idCard: '',
  address: '',
})

// Pagination
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0,
})

// Form validation rules
const createRules: FormRules = {
  name: [
    { required: true, message: '请输入会员姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
  ],
}

// Methods
const fetchMembers = async () => {
  try {
    tableLoading.value = true
    
    // Mock API call - replace with real API
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    // Mock data
    const mockMembers: Member[] = [
      {
        id: '1',
        memberNumber: 'M2024001',
        name: '张三',
        phone: '13812345678',
        email: 'zhangsan@example.com',
        gender: 'male',
        birthday: '1990-05-15',
        level: 'gold',
        points: 1200,
        status: 'active',
        lastCheckInAt: '2024-01-08T09:30:00.000Z',
        createdAt: '2023-12-01T10:00:00.000Z',
        updatedAt: '2024-01-08T09:30:00.000Z',
      },
      {
        id: '2',
        memberNumber: 'M2024002',
        name: '李四',
        phone: '13987654321',
        gender: 'female',
        birthday: '1992-08-20',
        level: 'silver',
        points: 800,
        status: 'active',
        lastCheckInAt: '2024-01-07T18:45:00.000Z',
        createdAt: '2023-11-15T14:20:00.000Z',
        updatedAt: '2024-01-07T18:45:00.000Z',
      },
    ]
    
    membersList.value = mockMembers
    pagination.total = mockMembers.length
    
    // Mock stats
    memberStats.value = {
      total: 156,
      active: 142,
      expiringSoon: 8,
      newThisMonth: 23,
    }
    
  } catch (error) {
    ElMessage.error('获取会员列表失败')
    console.error('Failed to fetch members:', error)
  } finally {
    tableLoading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchMembers()
}

const resetSearch = () => {
  Object.assign(searchForm, {
    search: '',
    status: '',
    level: '',
    gender: '',
  })
  handleSearch()
}

const handleSelectionChange = (selection: Member[]) => {
  selectedMembers.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  fetchMembers()
}

const handleCurrentChange = (page: number) => {
  pagination.page = page
  fetchMembers()
}

const viewMember = (member: Member) => {
  ElMessage.info(`查看会员详情: ${member.name}`)
  // Implement view member details
}

const editMember = (member: Member) => {
  ElMessage.info(`编辑会员: ${member.name}`)
  // Implement edit member
}

const handleMemberAction = async (command: string, member: Member) => {
  if (command === 'delete') {
    try {
      await ElMessageBox.confirm(
        `确定要删除会员 ${member.name} 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
      
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      
      ElMessage.success('删除成功')
      fetchMembers()
    } catch {
      // User cancelled
    }
  } else if (command === 'suspend') {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    ElMessage.success('会员已暂停')
    fetchMembers()
  } else if (command === 'activate') {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    ElMessage.success('会员已激活')
    fetchMembers()
  }
}

const handleCreateMember = async () => {
  if (!createFormRef.value) return
  
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      submitLoading.value = true
      
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      ElMessage.success('会员创建成功')
      showCreateDialog.value = false
      createFormRef.value?.resetFields()
      fetchMembers()
      
    } catch (error) {
      ElMessage.error('创建会员失败')
      console.error('Failed to create member:', error)
    } finally {
      submitLoading.value = false
    }
  })
}

const handleCloseCreateDialog = () => {
  createFormRef.value?.resetFields()
  showCreateDialog.value = false
}

// Utility functions
const getAge = (birthday: string): number => {
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

const getLevelName = (level: string): string => {
  const levelMap: Record<string, string> = {
    bronze: '铜牌',
    silver: '银牌',
    gold: '金牌',
    platinum: '白金',
    diamond: '钻石',
  }
  return levelMap[level] || level
}

const getLevelTagType = (level: string): string => {
  const levelTypeMap: Record<string, string> = {
    bronze: '',
    silver: 'info',
    gold: 'warning',
    platinum: 'success',
    diamond: 'danger',
  }
  return levelTypeMap[level] || ''
}

const getStatusName = (status: string): string => {
  const statusMap: Record<string, string> = {
    active: '活跃',
    inactive: '暂停',
    suspended: '已暂停',
    expired: '已过期',
  }
  return statusMap[status] || status
}

const getStatusTagType = (status: string): string => {
  const statusTypeMap: Record<string, string> = {
    active: 'success',
    inactive: 'info',
    suspended: 'warning',
    expired: 'danger',
  }
  return statusTypeMap[status] || ''
}

// Lifecycle
onMounted(() => {
  fetchMembers()
})
</script>

<style scoped lang="scss">
.members-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
  
  .header-left {
    .page-title {
      font-size: 28px;
      font-weight: 600;
      color: #333;
      margin: 0 0 5px 0;
    }
    
    .page-description {
      font-size: 14px;
      color: #666;
      margin: 0;
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stats-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  .stats-item {
    display: flex;
    align-items: center;
    
    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      font-size: 20px;
      
      &.primary {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      
      &.success {
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
      }
      
      &.warning {
        background: linear-gradient(135deg, #ff9800, #f57c00);
        color: white;
      }
      
      &.info {
        background: linear-gradient(135deg, #2196f3, #1976d2);
        color: white;
      }
    }
    
    .stats-content {
      .stats-number {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        line-height: 1.2;
      }
      
      .stats-label {
        font-size: 14px;
        color: #666;
        margin-top: 4px;
      }
    }
  }
}

.search-card, .table-card {
  margin-bottom: 20px;
  
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer {
  .el-button {
    min-width: 80px;
  }
}

// Responsive design
@media (max-width: 768px) {
  .members-container {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    
    .header-left {
      .page-title {
        font-size: 24px;
      }
    }
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  :deep(.el-table) {
    .el-table__body-wrapper {
      overflow-x: auto;
    }
  }
}
</style>