<template>
  <div class="schedule-container">
    <el-card>
      <!-- 顶部Tab -->
      <el-tabs v-model="activeTab" @tab-click="handleTabChange">
        <el-tab-pane label="排课" name="schedule">
          <ScheduleTab />
        </el-tab-pane>
        <el-tab-pane label="课程表" name="timetable">
          <TimetableTab />
        </el-tab-pane>
        <el-tab-pane label="日程列表" name="list">
          <ScheduleList />
        </el-tab-pane>
        <el-tab-pane label="冲突日程" name="conflict">
          <ConflictList />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ScheduleTab from './components/ScheduleTab.vue'
import TimetableTab from './components/TimetableTab.vue'
import ScheduleList from './components/ScheduleList.vue'
import ConflictList from './components/ConflictList.vue'

const activeTab = ref('timetable')

const handleTabChange = () => {
  // Tab切换时的处理
}
</script>

<style scoped lang="scss">
.schedule-container {
  padding: 20px;
}
</style>
