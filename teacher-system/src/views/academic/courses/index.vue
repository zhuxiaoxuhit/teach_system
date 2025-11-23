<template>
  <div class="courses-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="课程列表" name="courses">
          <CourseList />
        </el-tab-pane>
        <el-tab-pane label="升期关系列表" name="upgrades">
          <UpgradeList />
        </el-tab-pane>
        <el-tab-pane label="课程类别" name="categories">
          <CategoryList />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CourseList from './components/CourseList.vue'
import UpgradeList from './components/UpgradeList.vue'
import CategoryList from './components/CategoryList.vue'

const activeTab = ref('courses')
</script>

<style scoped lang="scss">
.courses-container {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}
</style>
