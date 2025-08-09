<template>
  <div class="bookings-view">
    <div class="page-header">
      <h1>预约管理</h1>
      <el-button type="primary" @click="$message.info('功能开发中')">
        <el-icon><Plus /></el-icon>
        新增预约
      </el-button>
    </div>
    
    <el-card>
      <el-empty description="预约管理功能开发中" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.bookings-view {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h1 {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
  }
}
</style>