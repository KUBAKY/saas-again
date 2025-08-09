<template>
  <div class="stores-view">
    <div class="page-header">
      <h1>门店管理</h1>
      <el-button type="primary" @click="$message.info('功能开发中')">
        <el-icon><Plus /></el-icon>
        新增门店
      </el-button>
    </div>
    
    <el-card>
      <el-empty description="门店管理功能开发中" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.stores-view {
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