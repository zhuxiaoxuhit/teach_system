<template>
  <div class="schedule-list-view">
    <!-- 这是原有的课程表视图，与Timetable类似但更简洁 -->
    <Timetable />
  </div>
</template>

<script setup lang="ts">
import Timetable from './Timetable.vue'
</script>

<style scoped lang="scss">
.schedule-list-view {
  // 样式在Timetable组件中
}
</style>
