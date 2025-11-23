<template>
  <div class="daily-list-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">新建排课</el-button>
        <el-button @click="showImportDialog = true">一对一排课导入</el-button>
        <el-button-group>
          <el-button
            :type="listType === 'normal' ? 'primary' : 'default'"
            @click="listType = 'normal'"
          >
            正常排课
          </el-button>
          <el-button
            :type="listType === 'cancelled' ? 'primary' : 'default'"
            @click="listType = 'cancelled'"
          >
            取消试点
          </el-button>
          <el-button
            :type="listType === 'all' ? 'primary' : 'default'"
            @click="listType = 'all'"
          >
            全部日程
          </el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-select v-model="filters.classroom" placeholder="班级/一对一一名称" clearable style="width: 200px">
          <el-option label="全部" value="" />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索班级/一对一一名称"
          style="width: 200px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button icon="Refresh" @click="loadSchedules">刷新</el-button>
      </div>
    </div>

    <!-- 日期范围选择 -->
    <div class="date-control">
      <span style="margin-right: 8px">上课日期：</span>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY年MM月DD日"
        value-format="YYYY-MM-DD"
        @change="loadSchedules"
      />
      <span class="date-info">选择时间: {{ dateRangeText }}</span>
      <span class="schedule-count">当前日程列表: 共计{{ total }}条排课数据</span>
    </div>

    <!-- 分组切换 -->
    <div class="group-tabs">
      <el-radio-group v-model="groupType" @change="loadSchedules">
        <el-radio-button label="none">驳回按钮</el-radio-button>
        <el-radio-button label="class">班级编号</el-radio-button>
        <el-radio-button label="date">排课日期</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 日程列表 -->
    <div v-loading="loading" class="schedule-list">
      <el-table :data="scheduleList" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="schedule_date" label="上课日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.schedule_date) }}
          </template>
        </el-table-column>
        <el-table-column prop="start_time" label="时间段" width="150">
          <template #default="{ row }">
            {{ formatTime(row.start_time) }}-{{ formatTime(row.end_time) }}
          </template>
        </el-table-column>
        <el-table-column prop="class_code" label="班级/一对一" width="200">
          <template #default="{ row }">
            <el-tag size="small">
              {{ row.class_code || `一对一-${row.student_name}` }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="course_name" label="课程" min-width="150" />
        <el-table-column prop="teacher_name" label="教师" width="100" />
        <el-table-column prop="classroom" label="教室" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              v-if="row.status !== 'cancelled'"
              type="warning"
              link
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-popconfirm
              title="确定删除这条排课吗？"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button type="danger" link size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadSchedules"
          @current-change="loadSchedules"
        />
      </div>
    </div>

    <!-- 新建排课对话框 -->
    <CreateScheduleDialog
      v-model="showCreateDialog"
      @success="loadSchedules"
    />

    <!-- 一对一导入对话框 -->
    <ImportOneToOneDialog
      v-model="showImportDialog"
      @success="loadSchedules"
    />

    <!-- 编辑对话框 -->
    <ScheduleDetailDialog
      v-model="showEditDialog"
      :schedule="selectedSchedule"
      @update="loadSchedules"
      @delete="loadSchedules"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { getSchedules, deleteSchedule, cancelSchedule } from '@/api/schedules'
import CreateScheduleDialog from './CreateScheduleDialog.vue'
import ImportOneToOneDialog from './ImportOneToOneDialog.vue'
import ScheduleDetailDialog from './ScheduleDetailDialog.vue'

const loading = ref(false)
const listType = ref('normal')
const groupType = ref('none')
const searchKeyword = ref('')
const showCreateDialog = ref(false)
const showImportDialog = ref(false)
const showEditDialog = ref(false)
const selectedSchedule = ref(null)

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const dateRange = ref<[string, string]>([
  dayjs().format('YYYY-MM-DD'),
  dayjs().add(7, 'day').format('YYYY-MM-DD')
])

const filters = ref({
  classroom: ''
})

const scheduleList = ref([])

// 日期范围文本
const dateRangeText = computed(() => {
  if (!dateRange.value || dateRange.value.length !== 2) return ''
  return `${dateRange.value[0]} 到 ${dateRange.value[1]}`
})

// 加载日程列表
const loadSchedules = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      pageSize: pageSize.value,
      startDate: dateRange.value[0],
      endDate: dateRange.value[1]
    }

    if (listType.value !== 'all') {
      params.status = listType.value === 'normal' ? 'normal' : 'cancelled'
    }

    if (filters.value.classroom) {
      params.classroom = filters.value.classroom
    }

    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }

    const res = await getSchedules(params)
    if (res.code === 200) {
      scheduleList.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('加载日程列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  if (!date) return ''
  return dayjs(date).format('YYYY年MM月DD日(周ddd)')
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return time.substring(0, 5)
}

// 获取状态类型
const getStatusType = (status: string) => {
  const typeMap: any = {
    normal: 'success',
    cancelled: 'warning',
    conflict: 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const textMap: any = {
    normal: '正常',
    cancelled: '已取消',
    conflict: '冲突'
  }
  return textMap[status] || status
}

// 编辑
const handleEdit = (row: any) => {
  selectedSchedule.value = row
  showEditDialog.value = true
}

// 取消
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定取消这条排课吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const res = await cancelSchedule(row.id)
    if (res.code === 200) {
      ElMessage.success('取消成功')
      loadSchedules()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

// 删除
const handleDelete = async (row: any) => {
  try {
    const res = await deleteSchedule(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      loadSchedules()
    }
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadSchedules()
})
</script>

<style scoped lang="scss">
.daily-list-container {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }
  }

  .date-control {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .date-info {
      color: #666;
      font-size: 14px;
    }

    .schedule-count {
      color: #1890ff;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .group-tabs {
    margin-bottom: 16px;
  }

  .schedule-list {
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
