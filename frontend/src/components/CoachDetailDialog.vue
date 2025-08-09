<template>
  <el-dialog
    v-model="dialogVisible"
    title="教练详情"
    width="800px"
    :close-on-click-modal="false"
  >
    <div v-if="coach" class="coach-detail">
      <el-row :gutter="20">
        <!-- 左侧基本信息 -->
        <el-col :span="12">
          <el-card class="info-card">
            <template #header>
              <span class="card-title">基本信息</span>
            </template>
            
            <div class="coach-profile">
              <el-avatar
                :size="80"
                :src="coach.avatar"
                class="coach-avatar"
              >
                {{ coach.name.charAt(0) }}
              </el-avatar>
              <div class="coach-basic">
                <h3>{{ coach.name }}</h3>
                <div class="coach-tags">
                  <el-tag
                    v-for="specialty in coach.specialties"
                    :key="specialty"
                    size="small"
                    type="primary"
                  >
                    {{ specialty }}
                  </el-tag>
                </div>
              </div>
            </div>
            
            <el-descriptions :column="1" size="small" border>
              <el-descriptions-item label="工号">
                {{ coach.employeeNumber }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ coach.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="邮箱">
                {{ coach.email || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="性别">
                {{ getGenderText(coach.gender) }}
              </el-descriptions-item>
              <el-descriptions-item label="生日">
                {{ formatDate(coach.birthday) }}
              </el-descriptions-item>
              <el-descriptions-item label="入职日期">
                {{ formatDate(coach.joinDate) }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="getStatusType(coach.status)">
                  {{ getStatusText(coach.status) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <!-- 右侧统计信息 -->
        <el-col :span="12">
          <el-card class="stats-card">
            <template #header>
              <span class="card-title">统计信息</span>
            </template>
            
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value">{{ coach.experienceYears }}</div>
                <div class="stat-label">从业年限</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">¥{{ coach.hourlyRate }}</div>
                <div class="stat-label">课时费</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ coach.totalSessions || 0 }}</div>
                <div class="stat-label">总课时</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ coach.rating?.toFixed(1) || '0.0' }}</div>
                <div class="stat-label">评分</div>
              </div>
            </div>
            
            <el-divider />
            
            <!-- 评分展示 -->
            <div class="rating-section">
              <div class="rating-title">学员评价</div>
              <el-rate
                :model-value="coach.rating"
                disabled
                :precision="0.1"
                size="large"
              />
              <span class="rating-text">{{ coach.rating?.toFixed(1) || '0.0' }} 分</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 个人简介 -->
        <el-col :span="24">
          <el-card>
            <template #header>
              <span class="card-title">个人简介</span>
            </template>
            <p class="introduction">
              {{ coach.introduction || '暂无个人简介' }}
            </p>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 资质认证 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <span class="card-title">资质认证</span>
            </template>
            <div v-if="coach.certifications?.length" class="certifications">
              <div
                v-for="cert in coach.certifications"
                :key="cert.name"
                class="certification-item"
              >
                <div class="cert-name">{{ cert.name }}</div>
                <div class="cert-info">
                  <span class="cert-issuer">{{ cert.issuer }}</span>
                  <span class="cert-date">{{ formatDate(cert.issueDate) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="no-data">
              暂无资质认证
            </div>
          </el-card>
        </el-col>
        
        <!-- 联系信息 -->
        <el-col :span="12">
          <el-card>
            <template #header>
              <span class="card-title">联系信息</span>
            </template>
            <el-descriptions :column="1" size="small">
              <el-descriptions-item label="紧急联系人">
                {{ coach.emergencyContact || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="紧急联系电话">
                {{ coach.emergencyPhone || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="银行账户">
                {{ coach.bankAccount || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="备注">
                {{ coach.notes || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit">
          编辑教练
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Coach } from '@/api/coaches'

interface Props {
  modelValue: boolean
  coach?: Coach | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', coach: Coach): void
}

const props = withDefaults(defineProps<Props>(), {
  coach: null
})

const emit = defineEmits<Emits>()

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 工具函数
const getGenderText = (gender?: string) => {
  const genderMap: Record<string, string> = {
    male: '男',
    female: '女',
    other: '其他'
  }
  return genderMap[gender || ''] || '-'
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
    active: '在职',
    inactive: '离职',
    suspended: '暂停'
  }
  return texts[status] || '未知'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 编辑教练
const handleEdit = () => {
  if (props.coach) {
    emit('edit', props.coach)
    dialogVisible.value = false
  }
}
</script>

<style scoped lang="scss">
.coach-detail {
  .info-card {
    .coach-profile {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      
      .coach-avatar {
        margin-right: 16px;
      }
      
      .coach-basic {
        h3 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        .coach-tags {
          .el-tag {
            margin-right: 8px;
            margin-bottom: 4px;
          }
        }
      }
    }
  }
  
  .stats-card {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      
      .stat-item {
        text-align: center;
        padding: 12px;
        border-radius: 8px;
        background: #f8f9fa;
        
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #666;
        }
      }
    }
    
    .rating-section {
      text-align: center;
      
      .rating-title {
        margin-bottom: 12px;
        font-weight: 500;
        color: #333;
      }
      
      .rating-text {
        margin-left: 8px;
        color: #666;
      }
    }
  }
  
  .card-title {
    font-weight: 500;
    color: #333;
  }
  
  .introduction {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
  
  .certifications {
    .certification-item {
      padding: 12px;
      border: 1px solid #ebeef5;
      border-radius: 6px;
      margin-bottom: 8px;
      
      .cert-name {
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
      }
      
      .cert-info {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #666;
        
        .cert-issuer {
          flex: 1;
        }
      }
    }
  }
  
  .no-data {
    text-align: center;
    color: #ccc;
    padding: 20px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>