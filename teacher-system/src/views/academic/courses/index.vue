<template>
  <div class="courses-container">
    <el-card>
      <div class="page-header">
        <h3>课程管理</h3>
        <el-button type="primary">新建课程</el-button>
      </div>
      <el-table :data="[]" style="width: 100%" border>
        <el-table-column prop="name" label="课程名称" />
        <el-table-column prop="category" label="课程类别" />
        <el-table-column prop="classCount" label="班级数" />
        <el-table-column label="操作" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.courses-container {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
}
</style>
