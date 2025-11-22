<template>
  <div class="evaluation-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="课堂点评" name="evaluation"></el-tab-pane>
        <el-tab-pane label="班级点评" name="class-evaluation"></el-tab-pane>
        <el-tab-pane label="课堂评价" name="course-review"></el-tab-pane>
      </el-tabs>

      <div class="filter-bar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="~"
          start-placeholder="上课日期"
          end-placeholder=""
          value-format="YYYY-MM-DD"
        />
        <el-select v-model="filters.campus" placeholder="校区" clearable style="width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="魏桥书院" value="1"></el-option>
        </el-select>
        <el-select v-model="filters.teacher" placeholder="班主任" clearable style="width: 120px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="杨倩" value="杨倩"></el-option>
          <el-option label="陈老师" value="陈老师"></el-option>
          <el-option label="梁辰" value="梁辰"></el-option>
        </el-select>
        <el-select v-model="filters.assistant" placeholder="助教" clearable style="width: 120px;">
          <el-option label="全部" value=""></el-option>
        </el-select>
        <el-input
          v-model="filters.keyword"
          placeholder="请输入班级/一对一"
          clearable
          style="width: 200px;"
        >
          <template #append>
            <el-button icon="Search" @click="handleSearch" />
          </template>
        </el-input>
        <el-button @click="clearFilters">清空筛选</el-button>
      </div>

      <div class="stat-info">
        共 {{ pagination.total }} 个班级
      </div>

      <el-table :data="tableData" style="width: 100%" border stripe>
        <el-table-column label="班级/一对一" width="250">
          <template #default="{ row }">
            <div>
              <el-tag size="small" type="info">班</el-tag>
              {{ row.className }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="teacher" label="班主任" width="120" />
        <el-table-column prop="assistant" label="助教" width="100" />
        <el-table-column prop="recordCount" label="上课记录" width="120" />
        <el-table-column prop="evaluatedCount" label="点评记录" width="120" />
        <el-table-column label="点评率" width="120">
          <template #default="{ row }">
            <el-progress
              :percentage="row.evaluationRate"
              :color="row.evaluationRate === 100 ? '#52c41a' : '#1890ff'"
            />
          </template>
        </el-table-column>
        <el-table-column prop="readCount" label="阅读率" width="100" />
        <el-table-column prop="attendanceCount" label="到课人数" width="100" />
        <el-table-column prop="redDotCount" label="小红花数" width="100" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewRecords(row)">
              查看上课记录
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
    </el-card>

    <!-- 上课记录对话框 -->
    <el-dialog
      v-model="recordDialogVisible"
      :title="`${currentClass?.className} - 上课记录`"
      width="1000px"
    >
      <el-table :data="classRecords" style="width: 100%" border>
        <el-table-column prop="date" label="上课日期" width="120" />
        <el-table-column prop="time" label="上课时间" width="150" />
        <el-table-column prop="attendanceCount" label="到课人数" width="100" />
        <el-table-column prop="evaluatedCount" label="已点评" width="100" />
        <el-table-column prop="unevaluatedCount" label="未点评" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已完成' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEvaluate(row)">点评</el-button>
            <el-button type="success" link @click="handleViewDetails(row)">查看详情</el-button>
            <el-button type="info" link>考勤统计</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <el-button @click="recordDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 点评对话框 -->
    <el-dialog
      v-model="evaluateDialogVisible"
      title="课堂点评"
      width="800px"
    >
      <el-form :model="evaluateForm" label-width="100px">
        <el-form-item label="上课日期">
          <span>{{ currentRecord?.date }} {{ currentRecord?.time }}</span>
        </el-form-item>
        <el-form-item label="到课学员">
          <el-tag v-for="student in attendanceStudents" :key="student.id" style="margin-right: 8px;">
            {{ student.name }}
          </el-tag>
        </el-form-item>
        <el-form-item label="点评内容">
          <el-input
            v-model="evaluateForm.content"
            type="textarea"
            :rows="5"
            placeholder="请输入点评内容"
          />
        </el-form-item>
        <el-form-item label="上传图片">
          <el-button type="primary" icon="Upload">上传图片</el-button>
          <span style="margin-left: 10px; color: #999; font-size: 12px;">支持jpg、png格式，最多9张</span>
        </el-form-item>
        <el-form-item label="小红花">
          <el-input-number v-model="evaluateForm.redDots" :min="0" :max="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitEvaluation">提交点评</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const activeTab = ref('evaluation')
const dateRange = ref([dayjs().subtract(30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')])
const recordDialogVisible = ref(false)
const evaluateDialogVisible = ref(false)

const filters = reactive({
  campus: '',
  teacher: '',
  assistant: '',
  keyword: ''
})

const evaluateForm = reactive({
  content: '',
  images: [],
  redDots: 0
})

// Mock数据
const generateMockData = () => {
  const classNames = [
    '06-农小硬笔-15:30',
    '01-农小一对一-20:15',
    '01-农小创意美术-15:40',
    '01-农小创意美术-17:30',
    '01-农小硬笔-15:40',
    '02-农小英语-14:00',
    '03-农小数学-16:00',
    '04-农小语文-18:00'
  ]

  const teachers = ['杨倩', '陈老师', '梁辰', '王老师']

  return classNames.map((name, index) => ({
    id: String(index + 1),
    className: name,
    teacher: teachers[index % teachers.length],
    assistant: Math.random() > 0.7 ? '助教' + (index % 3 + 1) : '-',
    recordCount: Math.floor(Math.random() * 10) + 3,
    evaluatedCount: Math.floor(Math.random() * 8) + 1,
    evaluationRate: Math.floor(Math.random() * 50) + 50,
    readCount: Math.floor(Math.random() * 5),
    attendanceCount: Math.floor(Math.random() * 15) + 5,
    redDotCount: Math.floor(Math.random() * 20)
  }))
}

const allData = ref(generateMockData())
const tableData = ref([...allData.value])
const currentClass = ref<any>(null)
const currentRecord = ref<any>(null)
const classRecords = ref<any[]>([])
const attendanceStudents = ref<any[]>([])

const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: allData.value.length
})

const handleSearch = () => {
  let filtered = [...allData.value]

  if (filters.teacher) {
    filtered = filtered.filter(item => item.teacher === filters.teacher)
  }
  if (filters.keyword) {
    filtered = filtered.filter(item => item.className.includes(filters.keyword))
  }

  pagination.total = filtered.length
  pagination.current = 1
  tableData.value = filtered.slice(0, pagination.pageSize)
  ElMessage.success(`找到 ${filtered.length} 条记录`)
}

const clearFilters = () => {
  filters.campus = ''
  filters.teacher = ''
  filters.assistant = ''
  filters.keyword = ''
  tableData.value = [...allData.value]
  pagination.total = allData.value.length
  ElMessage.info('已清空筛选条件')
}

const handleViewRecords = (row: any) => {
  currentClass.value = row

  // 生成模拟的上课记录
  classRecords.value = Array.from({ length: row.recordCount }, (_, index) => ({
    id: String(index + 1),
    date: dayjs().subtract(index * 2, 'day').format('YYYY-MM-DD'),
    time: '15:30-17:00',
    attendanceCount: Math.floor(Math.random() * 10) + 5,
    evaluatedCount: Math.floor(Math.random() * 8) + 2,
    unevaluatedCount: Math.floor(Math.random() * 3),
    status: Math.random() > 0.3 ? '已完成' : '进行中'
  }))

  recordDialogVisible.value = true
}

const handleEvaluate = (record: any) => {
  currentRecord.value = record

  // 生成模拟的到课学员
  const studentNames = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨敏', '赵磊', '黄强']
  attendanceStudents.value = Array.from({ length: record.attendanceCount }, (_, index) => ({
    id: String(index + 1),
    name: studentNames[index % studentNames.length] + (index > 7 ? index - 7 : '')
  }))

  evaluateDialogVisible.value = true
}

const handleViewDetails = (record: any) => {
  ElMessage.info(`查看 ${record.date} 的课堂详情`)
}

const handleSubmitEvaluation = () => {
  if (!evaluateForm.content) {
    ElMessage.warning('请输入点评内容')
    return
  }

  ElMessage.success('点评提交成功')
  evaluateDialogVisible.value = false
  evaluateForm.content = ''
  evaluateForm.redDots = 0

  // 更新记录状态
  if (currentRecord.value) {
    currentRecord.value.evaluatedCount++
    currentRecord.value.unevaluatedCount = Math.max(0, currentRecord.value.unevaluatedCount - 1)
  }
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadTableData()
}

const handleCurrentChange = (page: number) => {
  pagination.current = page
  loadTableData()
}

const loadTableData = () => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  tableData.value = allData.value.slice(start, end)
}
</script>

<style scoped lang="scss">
.evaluation-container {
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
