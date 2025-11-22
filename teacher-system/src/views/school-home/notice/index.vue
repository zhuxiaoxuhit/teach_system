<template>
  <div class="notice-container">
    <el-card>
      <div class="action-bar">
        <el-button type="primary">新建通知公告</el-button>
        <el-button>模板库</el-button>
        <el-button>全校群发</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column prop="title" label="标题" width="300" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="sendCount" label="发送人数" width="120" />
        <el-table-column prop="readRate" label="阅读率" width="150">
          <template #default="{ row }">
            <el-progress :percentage="row.readRate" />
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button type="primary" link>查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tableData = ref([
  {
    title: '期中考试通知',
    type: '校园通知',
    sendCount: 150,
    readRate: 85,
    sendTime: '2025-11-20 10:00:00'
  }
])
</script>

<style scoped lang="scss">
.notice-container {
  .action-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}
</style>
