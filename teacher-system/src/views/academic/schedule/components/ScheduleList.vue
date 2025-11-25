<template>
  <div class="schedule-list">
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
      <el-select v-model="filters.classId" placeholder="班级" clearable style="width: 150px;">
        <el-option label="全部班级" value=""></el-option>
      </el-select>
      <el-select v-model="filters.teacherName" placeholder="教师" clearable style="width: 120px;">
        <el-option label="全部教师" value=""></el-option>
      </el-select>
      <el-select v-model="filters.classroom" placeholder="教室" clearable style="width: 120px;">
        <el-option label="全部教室" value=""></el-option>
      </el-select>
      <el-select v-model="filters.status" placeholder="状态" clearable style="width: 120px;">
        <el-option label="全部" value=""></el-option>
        <el-option label="正常" value="normal"></el-option>
        <el-option label="已取消" value="cancelled"></el-option>
      </el-select>
      <el-button type="primary" @click="fetchSchedules">搜索</el-button>
      <el-button @click="clearFilters">清空筛选</el-button>
    </div>

    <div class="stat-info">
      共找到 {{ pagination.total }} 条排课记录
    </div>

    <el-table :data="tableData" style="width: 100%" border stripe>
      <el-table-column prop="schedule_date" label="日期" width="120" sortable />
      <el-table-column label="时间" width="150">
        <template #default="{ row }">
          {{ row.start_time }} - {{ row.end_time }}
        </template>
      </el-table-column>
      <el-table-column prop="class_code" label="班级" width="150" />
      <el-table-column prop="teacher_name" label="教师" width="120" />
      <el-table-column prop="course_name" label="课程" width="150" />
      <el-table-column prop="classroom" label="教室" width="120" />
      <el-table-column prop="schedule_type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="row.schedule_type === 'class' ? 'primary' : 'success'" size="small">
            {{ row.schedule_type === 'class' ? '班课' : '一对一' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">
            {{ row.status === 'normal' ? '正常' : '已取消' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleView(row)">查看</el-button>
          <el-button
            v-if="row.status === 'normal'"
            type="danger"
            link
            @click="handleCancel(row)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getSchedules, cancelSchedule } from '@/api/schedules'

// 筛选条件
const filters = reactive({
  dateRange: [
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD')
  ] as any,
  classId: '',
  teacherName: '',
  classroom: '',
  status: ''
})

// 表格数据
const tableData = ref<any[]>([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0
})

// 获取排课列表
const fetchSchedules = async () => {
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      params.startDate = filters.dateRange[0]
      params.endDate = filters.dateRange[1]
    }

    if (filters.classId) params.classId = filters.classId
    if (filters.teacherName) params.teacherName = filters.teacherName
    if (filters.classroom) params.classroom = filters.classroom
    if (filters.status) params.status = filters.status

    const res = await getSchedules(params)

    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载数据失败')
  }
}

// 清空筛选
const clearFilters = () => {
  filters.dateRange = [
    dayjs().startOf('month').format('YYYY-MM-DD'),
    dayjs().endOf('month').format('YYYY-MM-DD')
  ]
  filters.classId = ''
  filters.teacherName = ''
  filters.classroom = ''
  filters.status = ''
  fetchSchedules()
}

// 查看详情
const handleView = (row: any) => {
  ElMessage.info(`查看排课: ${row.id}`)
}

// 取消排课
const handleCancel = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要取消这个排课吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelSchedule(row.id)
    ElMessage.success('取消成功')
    await fetchSchedules()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchSchedules()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  fetchSchedules()
}

onMounted(() => {
  fetchSchedules()
})
</script>

<style scoped lang="scss">
.schedule-list {
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .stat-info {
    margin-bottom: 16px;
    font-size: 14px;
    color: #666;
  }

  .el-pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
