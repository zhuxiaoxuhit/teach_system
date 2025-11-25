<template>
  <div class="conflict-list">
    <div class="filter-bar">
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 280px;"
      />
      <el-button type="primary" @click="fetchConflicts">搜索</el-button>
      <el-button @click="clearFilters">清空筛选</el-button>
    </div>

    <div class="stat-info">
      <el-alert
        v-if="conflictData.length > 0"
        title="检测到时间冲突！"
        type="warning"
        :closable="false"
      >
        <template #default>
          共检测到 {{ conflictData.length }} 处时间冲突，请及时调整排课安排
        </template>
      </el-alert>
      <el-empty v-else description="暂无冲突日程" />
    </div>

    <el-table
      v-if="conflictData.length > 0"
      :data="conflictData"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="conflict_type" label="冲突类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.conflict_type === 'teacher' ? 'danger' : 'warning'" size="small">
            {{ row.conflict_type === 'teacher' ? '教师冲突' : '教室冲突' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="schedule_date" label="日期" width="120" />
      <el-table-column label="时间段" width="150">
        <template #default="{ row }">
          {{ row.start1 }} - {{ row.end1 }}
        </template>
      </el-table-column>
      <el-table-column label="冲突对象" width="120">
        <template #default="{ row }">
          {{ row.conflict_type === 'teacher' ? row.teacher_name : row.classroom }}
        </template>
      </el-table-column>
      <el-table-column label="排课1" min-width="200">
        <template #default="{ row }">
          <div>课程: {{ row.course1 || '-' }}</div>
          <div>教室: {{ row.classroom1 || '-' }}</div>
          <div v-if="row.conflict_type === 'teacher'">
            教师: {{ row.teacher_name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="排课2" min-width="200">
        <template #default="{ row }">
          <div>课程: {{ row.course2 || '-' }}</div>
          <div>教室: {{ row.classroom2 || '-' }}</div>
          <div v-if="row.conflict_type === 'teacher'">
            教师: {{ row.teacher_name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleResolve(row)">处理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getConflicts } from '@/api/schedules'

// 筛选条件
const filters = reactive({
  dateRange: [
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD')
  ] as any
})

// 冲突数据
const conflictData = ref<any[]>([])

// 获取冲突列表
const fetchConflicts = async () => {
  try {
    const params: any = {}

    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0]
      params.endDate = filters.dateRange[1]
    }

    const res = await getConflicts(params)

    if (res.code === 200) {
      conflictData.value = res.data
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载冲突数据失败')
  }
}

// 清空筛选
const clearFilters = () => {
  filters.dateRange = [
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD')
  ]
  fetchConflicts()
}

// 处理冲突
const handleResolve = (row: any) => {
  ElMessage.info('冲突处理功能开发中')
}

onMounted(() => {
  fetchConflicts()
})
</script>

<style scoped lang="scss">
.conflict-list {
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-info {
    margin-bottom: 16px;
  }

  .el-table {
    margin-top: 20px;
  }
}
</style>
