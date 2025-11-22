<template>
  <div class="homework-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="作业" name="homework"></el-tab-pane>
        <el-tab-pane label="成长记录" name="growth"></el-tab-pane>
      </el-tabs>

      <div class="action-bar">
        <el-button type="primary">布置作业</el-button>
        <el-button>模板库</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column prop="title" label="作业标题" width="200" />
        <el-table-column prop="class" label="班级" width="200" />
        <el-table-column prop="publishDate" label="发布时间" width="180" />
        <el-table-column prop="readRate" label="阅读率" width="120" />
        <el-table-column prop="submitRate" label="提交率" width="120" />
        <el-table-column prop="evaluateRate" label="点评率" width="120" />
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

const activeTab = ref('homework')
const tableData = ref([])
</script>

<style scoped lang="scss">
.homework-container {
  .action-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}
</style>
