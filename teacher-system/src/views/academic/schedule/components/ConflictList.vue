<template>
  <div class="conflict-list-container">
    <!-- 日期范围选择 -->
    <div class="date-control">
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        @change="loadConflicts"
      />
      <el-button type="primary" @click="loadConflicts">查询</el-button>
    </div>

    <!-- 冲突统计 -->
    <div class="conflict-stats">
      <el-alert
        v-if="conflicts.length > 0"
        :title="`共 ${conflicts.length} 条冲突记录`"
        type="warning"
        show-icon
        :closable="false"
      />
      <el-alert
        v-else
        title="暂无冲突记录"
        type="success"
        show-icon
        :closable="false"
      />
    </div>

    <!-- 冲突列表 -->
    <div v-loading="loading" class="conflict-list">
      <el-table :data="conflicts" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="schedule_date" label="上课日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.schedule_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="conflict_type" label="冲突类型" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.conflict_type === 'teacher' ? 'warning' : 'danger'"
              size="small"
            >
              {{ row.conflict_type === 'teacher' ? '教师冲突' : '教室冲突' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="hasTeacherConflict"
          prop="teacher_name"
          label="教师"
          width="100"
        />
        <el-table-column
          v-if="hasClassroomConflict"
          prop="classroom"
          label="教室"
          width="120"
        />
        <el-table-column label="排课1" min-width="200">
          <template #default="{ row }">
            <div class="conflict-detail">
              <div class="time">{{ formatTime(row.start1) }}-{{ formatTime(row.end1) }}</div>
              <div class="course">{{ row.course1 }}</div>
              <div class="classroom" v-if="row.classroom1">{{ row.classroom1 }}</div>
              <div class="teacher" v-if="row.teacher1">{{ row.teacher1 }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="排课2" min-width="200">
          <template #default="{ row }">
            <div class="conflict-detail">
              <div class="time">{{ formatTime(row.start2) }}-{{ formatTime(row.end2) }}</div>
              <div class="course">{{ row.course2 }}</div>
              <div class="classroom" v-if="row.classroom2">{{ row.classroom2 }}</div>
              <div class="teacher" v-if="row.teacher2">{{ row.teacher2 }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleResolve(row, 1)">
              处理排课1
            </el-button>
            <el-button type="primary" link size="small" @click="handleResolve(row, 2)">
              处理排课2
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 处理冲突对话框 -->
    <el-dialog
      v-model="showResolveDialog"
      title="处理冲突"
      width="500px"
    >
      <div class="resolve-options">
        <p>请选择处理方式：</p>
        <el-radio-group v-model="resolveAction">
          <el-radio label="edit">调整时间</el-radio>
          <el-radio label="cancel">取消排课</el-radio>
          <el-radio label="delete">删除排课</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showResolveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmResolve">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getConflicts, cancelSchedule, deleteSchedule } from '@/api/schedules'

const loading = ref(false)
const dateRange = ref<[string, string]>([
  dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  dayjs().add(7, 'day').format('YYYY-MM-DD')
])

const conflicts = ref<any[]>([])
const showResolveDialog = ref(false)
const resolveAction = ref('edit')
const selectedConflict = ref<any>(null)
const selectedScheduleIndex = ref(1)

// 是否有教师冲突
const hasTeacherConflict = computed(() => {
  return conflicts.value.some(c => c.conflict_type === 'teacher')
})

// 是否有教室冲突
const hasClassroomConflict = computed(() => {
  return conflicts.value.some(c => c.conflict_type === 'classroom')
})

// 加载冲突列表
const loadConflicts = async () => {
  loading.value = true
  try {
    const res = await getConflicts({
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    })
    if (res.code === 200) {
      conflicts.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载冲突列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return time.substring(0, 5)
}

// 处理冲突
const handleResolve = (conflict: any, index: number) => {
  selectedConflict.value = conflict
  selectedScheduleIndex.value = index
  showResolveDialog.value = true
}

// 确认处理
const confirmResolve = async () => {
  const scheduleId = selectedScheduleIndex.value === 1
    ? selectedConflict.value.schedule1_id
    : selectedConflict.value.schedule2_id

  try {
    if (resolveAction.value === 'cancel') {
      await cancelSchedule(scheduleId)
      ElMessage.success('已取消排课')
    } else if (resolveAction.value === 'delete') {
      await ElMessageBox.confirm('确定删除这条排课吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await deleteSchedule(scheduleId)
      ElMessage.success('已删除排课')
    } else if (resolveAction.value === 'edit') {
      ElMessage.info('请前往日程列表编辑排课时间')
    }
    showResolveDialog.value = false
    loadConflicts()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

onMounted(() => {
  loadConflicts()
})
</script>

<style scoped lang="scss">
.conflict-list-container {
  .date-control {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .conflict-stats {
    margin-bottom: 16px;
  }

  .conflict-list {
    .conflict-detail {
      font-size: 12px;

      .time {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .course {
        color: #606266;
        margin-bottom: 2px;
      }

      .classroom,
      .teacher {
        color: #909399;
        font-size: 11px;
      }
    }
  }

  .resolve-options {
    p {
      margin-bottom: 16px;
      font-weight: 500;
    }

    .el-radio-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }
}
</style>
