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
              </el-descriptions-item>\n              <el-descriptions-item label="状态">\n                <el-tag :type="getStatusType(coach.status)">\n                  {{ getStatusText(coach.status) }}\n                </el-tag>\n              </el-descriptions-item>\n            </el-descriptions>\n          </el-card>\n        </el-col>\n        \n        <!-- 右侧统计信息 -->\n        <el-col :span=\"12\">\n          <el-card class=\"stats-card\">\n            <template #header>\n              <span class=\"card-title\">统计信息</span>\n            </template>\n            \n            <div class=\"stats-grid\">\n              <div class=\"stat-item\">\n                <div class=\"stat-value\">{{ coach.experienceYears }}</div>\n                <div class=\"stat-label\">从业年限</div>\n              </div>\n              <div class=\"stat-item\">\n                <div class=\"stat-value\">¥{{ coach.hourlyRate }}</div>\n                <div class=\"stat-label\">课时费</div>\n              </div>\n              <div class=\"stat-item\">\n                <div class=\"stat-value\">{{ coach.totalSessions || 0 }}</div>\n                <div class=\"stat-label\">总课时</div>\n              </div>\n              <div class=\"stat-item\">\n                <div class=\"stat-value\">{{ coach.rating?.toFixed(1) || '0.0' }}</div>\n                <div class=\"stat-label\">评分</div>\n              </div>\n            </div>\n            \n            <el-divider />\n            \n            <!-- 评分展示 -->\n            <div class=\"rating-section\">\n              <div class=\"rating-title\">学员评价</div>\n              <el-rate\n                :model-value=\"coach.rating\"\n                disabled\n                :precision=\"0.1\"\n                size=\"large\"\n              />\n              <span class=\"rating-text\">{{ coach.rating?.toFixed(1) || '0.0' }} 分</span>\n            </div>\n          </el-card>\n        </el-col>\n      </el-row>\n      \n      <el-row :gutter=\"20\" style=\"margin-top: 20px\">\n        <!-- 个人简介 -->\n        <el-col :span=\"24\">\n          <el-card>\n            <template #header>\n              <span class=\"card-title\">个人简介</span>\n            </template>\n            <p class=\"introduction\">\n              {{ coach.introduction || '暂无个人简介' }}\n            </p>\n          </el-card>\n        </el-col>\n      </el-row>\n      \n      <el-row :gutter=\"20\" style=\"margin-top: 20px\">\n        <!-- 资质认证 -->\n        <el-col :span=\"12\">\n          <el-card>\n            <template #header>\n              <span class=\"card-title\">资质认证</span>\n            </template>\n            <div v-if=\"coach.certifications?.length\" class=\"certifications\">\n              <div\n                v-for=\"cert in coach.certifications\"\n                :key=\"cert.name\"\n                class=\"certification-item\"\n              >\n                <div class=\"cert-name\">{{ cert.name }}</div>\n                <div class=\"cert-info\">\n                  <span class=\"cert-issuer\">{{ cert.issuer }}</span>\n                  <span class=\"cert-date\">{{ formatDate(cert.issueDate) }}</span>\n                </div>\n              </div>\n            </div>\n            <div v-else class=\"no-data\">\n              暂无资质认证\n            </div>\n          </el-card>\n        </el-col>\n        \n        <!-- 联系信息 -->\n        <el-col :span=\"12\">\n          <el-card>\n            <template #header>\n              <span class=\"card-title\">联系信息</span>\n            </template>\n            <el-descriptions :column=\"1\" size=\"small\">\n              <el-descriptions-item label=\"紧急联系人\">\n                {{ coach.emergencyContact || '-' }}\n              </el-descriptions-item>\n              <el-descriptions-item label=\"紧急联系电话\">\n                {{ coach.emergencyPhone || '-' }}\n              </el-descriptions-item>\n              <el-descriptions-item label=\"银行账户\">\n                {{ coach.bankAccount || '-' }}\n              </el-descriptions-item>\n              <el-descriptions-item label=\"备注\">\n                {{ coach.notes || '-' }}\n              </el-descriptions-item>\n            </el-descriptions>\n          </el-card>\n        </el-col>\n      </el-row>\n    </div>\n    \n    <template #footer>\n      <div class=\"dialog-footer\">\n        <el-button @click=\"dialogVisible = false\">关闭</el-button>\n        <el-button type=\"primary\" @click=\"handleEdit\">\n          编辑教练\n        </el-button>\n      </div>\n    </template>\n  </el-dialog>\n</template>\n\n<script setup lang=\"ts\">\nimport { computed } from 'vue'\nimport type { Coach } from '@/api/coaches'\n\ninterface Props {\n  modelValue: boolean\n  coach?: Coach | null\n}\n\ninterface Emits {\n  (e: 'update:modelValue', value: boolean): void\n  (e: 'edit', coach: Coach): void\n}\n\nconst props = withDefaults(defineProps<Props>(), {\n  coach: null\n})\n\nconst emit = defineEmits<Emits>()\n\n// 计算属性\nconst dialogVisible = computed({\n  get: () => props.modelValue,\n  set: (value) => emit('update:modelValue', value)\n})\n\n// 工具函数\nconst getGenderText = (gender?: string) => {\n  const genderMap: Record<string, string> = {\n    male: '男',\n    female: '女',\n    other: '其他'\n  }\n  return genderMap[gender || ''] || '-'\n}\n\nconst getStatusType = (status: string) => {\n  const types: Record<string, string> = {\n    active: 'success',\n    inactive: 'info',\n    suspended: 'warning'\n  }\n  return types[status] || 'info'\n}\n\nconst getStatusText = (status: string) => {\n  const texts: Record<string, string> = {\n    active: '在职',\n    inactive: '离职',\n    suspended: '暂停'\n  }\n  return texts[status] || '未知'\n}\n\nconst formatDate = (dateStr?: string) => {\n  if (!dateStr) return '-'\n  return new Date(dateStr).toLocaleDateString('zh-CN')\n}\n\n// 编辑教练\nconst handleEdit = () => {\n  if (props.coach) {\n    emit('edit', props.coach)\n    dialogVisible.value = false\n  }\n}\n</script>\n\n<style scoped lang=\"scss\">\n.coach-detail {\n  .info-card {\n    .coach-profile {\n      display: flex;\n      align-items: center;\n      margin-bottom: 20px;\n      \n      .coach-avatar {\n        margin-right: 16px;\n      }\n      \n      .coach-basic {\n        h3 {\n          margin: 0 0 8px 0;\n          color: #333;\n        }\n        \n        .coach-tags {\n          .el-tag {\n            margin-right: 8px;\n            margin-bottom: 4px;\n          }\n        }\n      }\n    }\n  }\n  \n  .stats-card {\n    .stats-grid {\n      display: grid;\n      grid-template-columns: repeat(2, 1fr);\n      gap: 16px;\n      \n      .stat-item {\n        text-align: center;\n        padding: 12px;\n        border-radius: 8px;\n        background: #f8f9fa;\n        \n        .stat-value {\n          font-size: 24px;\n          font-weight: 600;\n          color: #333;\n          margin-bottom: 4px;\n        }\n        \n        .stat-label {\n          font-size: 12px;\n          color: #666;\n        }\n      }\n    }\n    \n    .rating-section {\n      text-align: center;\n      \n      .rating-title {\n        margin-bottom: 12px;\n        font-weight: 500;\n        color: #333;\n      }\n      \n      .rating-text {\n        margin-left: 8px;\n        color: #666;\n      }\n    }\n  }\n  \n  .card-title {\n    font-weight: 500;\n    color: #333;\n  }\n  \n  .introduction {\n    color: #666;\n    line-height: 1.6;\n    margin: 0;\n  }\n  \n  .certifications {\n    .certification-item {\n      padding: 12px;\n      border: 1px solid #ebeef5;\n      border-radius: 6px;\n      margin-bottom: 8px;\n      \n      .cert-name {\n        font-weight: 500;\n        color: #333;\n        margin-bottom: 4px;\n      }\n      \n      .cert-info {\n        display: flex;\n        justify-content: space-between;\n        font-size: 12px;\n        color: #666;\n        \n        .cert-issuer {\n          flex: 1;\n        }\n      }\n    }\n  }\n  \n  .no-data {\n    text-align: center;\n    color: #ccc;\n    padding: 20px;\n  }\n}\n\n.dialog-footer {\n  text-align: right;\n}\n</style>"