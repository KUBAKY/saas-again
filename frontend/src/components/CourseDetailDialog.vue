<template>
  <el-dialog
    v-model="dialogVisible"
    title="课程详情"
    width="600px"
    :close-on-click-modal="false"
  >
    <div v-if="course" class="course-detail">
      <div class="course-header">
        <h3>{{ course.name }}</h3>
        <el-tag :type="getTypeColor(course.type)" size="large">
          {{ getTypeText(course.type) }}
        </el-tag>
      </div>
      
      <el-descriptions :column="2" size="small" border>
        <el-descriptions-item label="课程时长">
          {{ course.duration }} 分钟
        </el-descriptions-item>
        <el-descriptions-item label="难度等级">
          <el-rate
            :model-value="course.difficultyLevel"
            disabled
            size="small"
            :max="5"
          />
        </el-descriptions-item>
        <el-descriptions-item label="最大人数">
          {{ course.maxParticipants }} 人
        </el-descriptions-item>
        <el-descriptions-item label="价格">
          ¥{{ course.price }}
        </el-descriptions-item>
        <el-descriptions-item label="状态" :span="2">
          <el-tag :type="getStatusColor(course.status)">
            {{ getStatusText(course.status) }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <div class="course-description">
        <h4>课程介绍</h4>
        <p>{{ course.description || '暂无课程介绍' }}</p>
      </div>
      
      <div v-if="course.requirements" class="course-requirements">
        <h4>课程要求</h4>
        <p>{{ course.requirements }}</p>
      </div>
      
      <div v-if="course.equipment?.length" class="course-equipment">
        <h4>所需设备</h4>
        <div class="equipment-list">
          <el-tag
            v-for="equipment in course.equipment"
            :key="equipment"
            size="small"
            class="equipment-tag"
          >
            {{ equipment }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit">
          编辑课程
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Course {
  id: string
  name: string
  type: 'group' | 'personal'
  duration: number
  difficultyLevel: number
  maxParticipants: number
  price: number
  status: 'active' | 'inactive' | 'draft'
  description?: string
  requirements?: string
  equipment?: string[]
}

interface Props {
  modelValue: boolean
  course?: Course | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'edit', course: Course): void
}

const props = withDefaults(defineProps<Props>(), {
  course: null
})

const emit = defineEmits<Emits>()

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 工具函数
const getTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    group: '团课',
    personal: '私教'
  }
  return typeMap[type] || '未知'
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    group: 'primary',
    personal: 'success'
  }
  return colorMap[type] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    active: '启用',
    inactive: '禁用',
    draft: '草稿'
  }
  return statusMap[status] || '未知'
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'success',
    inactive: 'danger',
    draft: 'warning'
  }
  return colorMap[status] || 'info'
}

// 编辑课程
const handleEdit = () => {
  if (props.course) {
    emit('edit', props.course)
    dialogVisible.value = false
  }
}
</script>

<style scoped lang="scss">
.course-detail {
  .course-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h3 {
      margin: 0;
      color: #333;
    }
  }
  
  .course-description,
  .course-requirements {
    margin-top: 20px;
    
    h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 14px;
    }
    
    p {
      margin: 0;
      color: #666;
      line-height: 1.6;
    }
  }
  
  .course-equipment {
    margin-top: 20px;
    
    h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 14px;
    }
    
    .equipment-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      
      .equipment-tag {
        margin: 0;
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}
</style>