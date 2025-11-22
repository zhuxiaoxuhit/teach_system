<template>
  <div class="service-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="家长申请" name="apply"></el-tab-pane>
        <el-tab-pane label="意见反馈" name="feedback"></el-tab-pane>
        <el-tab-pane label="课程评价" name="review"></el-tab-pane>
      </el-tabs>

      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column prop="studentName" label="学员姓名" width="120" />
        <el-table-column prop="applyType" label="申请类型" width="120" />
        <el-table-column prop="content" label="申请内容" />
        <el-table-column prop="applyTime" label="申请时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.status === '已处理' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button v-if="row.status === '待处理'" type="primary" link>处理</el-button>
            <el-button v-else type="info" link>查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('apply')
const tableData = ref([])
</script>

<style scoped lang="scss">
.service-container {
}
</style>
