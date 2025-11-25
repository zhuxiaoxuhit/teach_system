<template>
  <div class="timetable-tab">
    <!-- 视图切换和筛选 -->
    <div class="filter-bar">
      <el-radio-group v-model="viewType" @change="handleViewTypeChange">
        <el-radio-button label="time">时间课表</el-radio-button>
        <el-radio-button label="teacher">教师课表</el-radio-button>
        <el-radio-button label="classroom">教室课表</el-radio-button>
        <el-radio-button label="class">班级课表</el-radio-button>
      </el-radio-group>

      <el-date-picker
        v-model="weekDate"
        type="week"
        format="YYYY 第 ww 周"
        placeholder="选择周"
        @change="handleWeekChange"
        style="width: 200px; margin-left: 20px;"
      />

      <el-select
        v-model="filters.campus"
        placeholder="校区"
        clearable
        style="width: 120px; margin-left: 12px;"
        @change="fetchTimetable"
      >
        <el-option label="魏桥书院" value="魏桥书院"></el-option>
      </el-select>

      <el-button type="primary" :icon="Refresh" @click="fetchTimetable" style="margin-left: 12px;">
        刷新
      </el-button>
    </div>

    <!-- 课程表网格 -->
    <div class="timetable-grid">
      <table class="timetable-table">
        <thead>
          <tr>
            <th class="time-column">时间</th>
            <th v-for="day in weekDays" :key="day.value">
              {{ day.label }}<br />
              <span class="date-text">{{ day.date }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="timeSlot in timeSlots" :key="timeSlot">
            <td class="time-column">{{ timeSlot }}</td>
            <td
              v-for="day in weekDays"
              :key="`${day.value}-${timeSlot}`"
              class="schedule-cell"
              @click="handleCellClick(day.fullDate, timeSlot)"
            >
              <div
                v-for="schedule in getCellSchedules(day.fullDate, timeSlot)"
                :key="schedule.id"
                class="schedule-item"
                :class="getScheduleClass(schedule)"
                @click.stop="handleScheduleClick(schedule)"
              >
                <div class="schedule-time">{{ schedule.start_time }} - {{ schedule.end_time }}</div>
                <div class="schedule-info">
                  <span class="schedule-tag">{{ getScheduleTag(schedule) }}</span>
                  {{ getScheduleTitle(schedule) }}
                </div>
                <div class="schedule-detail">{{ getScheduleDetail(schedule) }}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 排课详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="排课详情"
      width="600px"
    >
      <el-descriptions v-if="currentSchedule" :column="2" border>
        <el-descriptions-item label="日期">{{ formatDate(currentSchedule.schedule_date) }}</el-descriptions-item>
        <el-descriptions-item label="时间">
          {{ currentSchedule.start_time }} - {{ currentSchedule.end_time }}
        </el-descriptions-item>
        <el-descriptions-item label="班级">{{ currentSchedule.class_code || '-' }}</el-descriptions-item>
        <el-descriptions-item label="课程">{{ currentSchedule.course_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="教师">{{ currentSchedule.teacher_name || '-' }}</el-descriptions-item>
        <el-descriptions-item label="教室">{{ currentSchedule.classroom || '-' }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          {{ currentSchedule.schedule_type === 'class' ? '班课' : '一对一' }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentSchedule.status === 'normal' ? 'success' : 'danger'">
            {{ currentSchedule.status === 'normal' ? '正常' : '已取消' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ currentSchedule.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="danger" @click="handleCancelSchedule">取消排课</el-button>
      </template>
    </el-dialog>

    <!-- 新增排课对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增排课"
      width="700px"
    >
      <el-form :model="addForm" label-width="100px" ref="addFormRef">
        <el-form-item label="排课类型" required>
          <el-radio-group v-model="addForm.scheduleType">
            <el-radio label="class">班级排课</el-radio>
            <el-radio label="onetoone">一对一排课</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="addForm.scheduleType === 'class'" label="班级" required>
          <el-select v-model="addForm.classId" placeholder="请选择班级" style="width: 100%;" @change="handleClassChange">
            <el-option
              v-for="cls in classList"
              :key="cls.id"
              :label="cls.code"
              :value="cls.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="addForm.scheduleType === 'onetoone'" label="学员" required>
          <el-select v-model="addForm.studentId" placeholder="请选择学员" style="width: 100%;">
            <el-option
              v-for="student in studentList"
              :key="student.id"
              :label="student.name"
              :value="student.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="课程" required>
          <el-select v-model="addForm.courseId" placeholder="请选择课程" style="width: 100%;" @change="handleCourseChange">
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="教师" required>
          <el-input v-model="addForm.teacherName" placeholder="请输入教师姓名" />
        </el-form-item>

        <el-form-item label="教室" required>
          <el-input v-model="addForm.classroom" placeholder="请输入教室" />
        </el-form-item>

        <el-form-item label="日期" required>
          <el-date-picker
            v-model="addForm.scheduleDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="开始时间" required>
          <el-time-select
            v-model="addForm.startTime"
            start="08:00"
            step="00:30"
            end="22:00"
            placeholder="选择开始时间"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="结束时间" required>
          <el-time-select
            v-model="addForm.endTime"
            start="08:00"
            step="00:30"
            end="22:00"
            placeholder="选择结束时间"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="校区">
          <el-select v-model="addForm.campus" placeholder="请选择校区" style="width: 100%;">
            <el-option label="魏桥书院" value="魏桥书院" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="addForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSchedule">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import { getTimetable, cancelSchedule, createSchedule } from '@/api/schedules'
import { getClassList } from '@/api/class'
import { getStudentList } from '@/api/student'
import { getCourseList } from '@/api/course'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

const viewType = ref('time')
const weekDate = ref(new Date())
const detailDialogVisible = ref(false)
const addDialogVisible = ref(false)
const currentSchedule = ref<any>(null)
const addFormRef = ref()

// 新增排课表单
const addForm = reactive({
  scheduleType: 'class',
  classId: null as number | null,
  studentId: null as number | null,
  courseId: null as number | null,
  courseName: '',
  teacherName: '',
  classroom: '',
  scheduleDate: '',
  startTime: '',
  endTime: '',
  campus: '魏桥书院',
  remark: ''
})

// 数据列表
const classList = ref<any[]>([])
const studentList = ref<any[]>([])
const courseList = ref<any[]>([])

// 筛选条件
const filters = reactive({
  campus: ''
})

// 时间段
const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
]

// 星期数据
const weekDays = computed(() => {
  const start = dayjs(weekDate.value).startOf('isoWeek')
  return Array.from({ length: 7 }, (_, i) => {
    const date = start.add(i, 'day')
    return {
      value: i + 1,
      label: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i],
      date: date.format('MM-DD'),
      fullDate: date.format('YYYY-MM-DD')
    }
  })
})

// 课表数据
const timetableData = ref<any[]>([])

// 获取课表数据
const fetchTimetable = async () => {
  try {
    const start = dayjs(weekDate.value).startOf('isoWeek')
    const end = dayjs(weekDate.value).endOf('isoWeek')

    const params: any = {
      viewType: viewType.value,
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    }

    if (filters.campus) {
      params.campus = filters.campus
    }

    const res = await getTimetable(params)

    if (res.code === 200) {
      const dataMap = res.data
      timetableData.value = Object.values(dataMap).flat()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载课表失败')
  }
}

// 获取单元格的排课
const getCellSchedules = (date: string, timeSlot: string) => {
  return timetableData.value.filter(schedule => {
    // 将数据库日期格式转换为 YYYY-MM-DD
    const scheduleDate = schedule.schedule_date.substring(0, 10)
    if (scheduleDate !== date) return false

    const scheduleTime = schedule.start_time.substring(0, 5)
    const [hour] = scheduleTime.split(':')
    const slotHour = timeSlot.split(':')[0]

    return hour === slotHour
  })
}

// 获取排课样式类名
const getScheduleClass = (schedule: any) => {
  return {
    'schedule-class': schedule.schedule_type === 'class',
    'schedule-onetoone': schedule.schedule_type === 'onetoone',
    'schedule-cancelled': schedule.status === 'cancelled'
  }
}

// 获取排课标签
const getScheduleTag = (schedule: any) => {
  return schedule.schedule_type === 'class' ? '班' : '1v1'
}

// 获取排课标题
const getScheduleTitle = (schedule: any) => {
  if (viewType.value === 'time') {
    return schedule.class_code || schedule.student_name || schedule.course_name
  } else if (viewType.value === 'teacher') {
    return schedule.class_code || schedule.course_name
  } else if (viewType.value === 'classroom') {
    return schedule.teacher_name || schedule.class_code
  } else {
    return schedule.teacher_name || schedule.course_name
  }
}

// 获取排课详情
const getScheduleDetail = (schedule: any) => {
  if (viewType.value === 'time') {
    return `${schedule.teacher_name || ''} ${schedule.classroom || ''}`
  } else if (viewType.value === 'teacher') {
    return schedule.classroom || ''
  } else if (viewType.value === 'classroom') {
    return schedule.class_code || schedule.course_name || ''
  } else {
    return schedule.classroom || ''
  }
}

// 视图类型切换
const handleViewTypeChange = () => {
  fetchTimetable()
}

// 周切换
const handleWeekChange = () => {
  fetchTimetable()
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return dateStr ? dateStr.substring(0, 10) : ''
}

// 单元格点击 - 新增排课
const handleCellClick = (date: string, timeSlot: string) => {
  // 检查该时间段是否有排课
  const schedules = getCellSchedules(date, timeSlot)
  if (schedules.length > 0) return

  // 打开新增对话框
  addForm.scheduleDate = date
  addForm.startTime = timeSlot
  // 默认结束时间为开始时间+1.5小时
  const [hour, minute] = timeSlot.split(':')
  const endHour = parseInt(hour) + 1
  const endMinute = parseInt(minute) + 30
  addForm.endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute >= 60 ? endMinute - 60 : endMinute).padStart(2, '0')}`

  addDialogVisible.value = true
}

// 排课点击
const handleScheduleClick = (schedule: any) => {
  currentSchedule.value = schedule
  detailDialogVisible.value = true
}

// 班级选择变化
const handleClassChange = (classId: number) => {
  const selectedClass = classList.value.find(c => c.id === classId)
  if (selectedClass) {
    addForm.teacherName = selectedClass.teacher || ''
    addForm.classroom = selectedClass.classroom || ''
  }
}

// 课程选择变化
const handleCourseChange = (courseId: number) => {
  const selectedCourse = courseList.value.find(c => c.id === courseId)
  if (selectedCourse) {
    addForm.courseName = selectedCourse.name || ''
  }
}

// 新增排课
const handleAddSchedule = async () => {
  try {
    // 验证必填项
    if (addForm.scheduleType === 'class' && !addForm.classId) {
      ElMessage.error('请选择班级')
      return
    }
    if (addForm.scheduleType === 'onetoone' && !addForm.studentId) {
      ElMessage.error('请选择学员')
      return
    }
    if (!addForm.courseId || !addForm.teacherName || !addForm.classroom ||
        !addForm.scheduleDate || !addForm.startTime || !addForm.endTime) {
      ElMessage.error('请填写完整信息')
      return
    }

    // 计算星期几
    const weekDay = dayjs(addForm.scheduleDate).isoWeekday()

    const scheduleData: any = {
      courseId: addForm.courseId,
      courseName: addForm.courseName,
      teacherName: addForm.teacherName,
      classroom: addForm.classroom,
      scheduleDate: addForm.scheduleDate,
      startTime: addForm.startTime,
      endTime: addForm.endTime,
      weekDay: weekDay,
      scheduleType: addForm.scheduleType,
      status: 'normal',
      campus: addForm.campus,
      remark: addForm.remark
    }

    if (addForm.scheduleType === 'class') {
      scheduleData.classId = addForm.classId
    } else {
      scheduleData.studentId = addForm.studentId
    }

    await createSchedule(scheduleData)
    ElMessage.success('排课成功')
    addDialogVisible.value = false

    // 重置表单
    addForm.scheduleType = 'class'
    addForm.classId = null
    addForm.studentId = null
    addForm.courseId = null
    addForm.courseName = ''
    addForm.teacherName = ''
    addForm.classroom = ''
    addForm.scheduleDate = ''
    addForm.startTime = ''
    addForm.endTime = ''
    addForm.remark = ''

    // 刷新课表
    await fetchTimetable()
  } catch (error: any) {
    ElMessage.error(error.message || '新增失败')
  }
}

// 取消排课
const handleCancelSchedule = async () => {
  try {
    await ElMessageBox.confirm('确定要取消这个排课吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelSchedule(currentSchedule.value.id)
    ElMessage.success('取消成功')
    detailDialogVisible.value = false
    await fetchTimetable()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

// 加载基础数据
const loadBaseData = async () => {
  try {
    // 加载班级列表
    const classRes = await getClassList({ page: 1, pageSize: 1000 })
    if (classRes.code === 200) {
      classList.value = classRes.data.list || []
    }

    // 加载学员列表
    const studentRes = await getStudentList({ page: 1, pageSize: 1000 })
    if (studentRes.code === 200) {
      studentList.value = studentRes.data.list || []
    }

    // 加载课程列表
    const courseRes = await getCourseList({ page: 1, pageSize: 1000 })
    if (courseRes.code === 200) {
      courseList.value = courseRes.data.list || []
    }
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

onMounted(() => {
  fetchTimetable()
  loadBaseData()
})
</script>

<style scoped lang="scss">
.timetable-tab {
  .filter-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .timetable-grid {
    overflow-x: auto;
  }

  .timetable-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1200px;

    th,
    td {
      border: 1px solid #e4e7ed;
      padding: 8px;
      text-align: center;
      vertical-align: top;
    }

    th {
      background: #f5f7fa;
      font-weight: 600;
      color: #303133;
      padding: 12px 8px;
    }

    .time-column {
      width: 80px;
      background: #fafafa;
      font-weight: 500;
    }

    .date-text {
      font-size: 12px;
      color: #909399;
      font-weight: normal;
    }

    .schedule-cell {
      min-height: 60px;
      cursor: pointer;
      position: relative;
      padding: 4px;

      &:hover {
        background: #f5f7fa;
      }
    }

    .schedule-item {
      background: #e6f7ff;
      border: 1px solid #91d5ff;
      border-radius: 4px;
      padding: 6px 8px;
      margin-bottom: 4px;
      font-size: 12px;
      text-align: left;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.schedule-class {
        background: #e6f7ff;
        border-color: #91d5ff;
      }

      &.schedule-onetoone {
        background: #f0f9ff;
        border-color: #bae7ff;
      }

      &.schedule-cancelled {
        background: #fff1f0;
        border-color: #ffa39e;
        opacity: 0.6;
      }

      .schedule-time {
        font-size: 11px;
        color: #666;
        margin-bottom: 2px;
      }

      .schedule-info {
        font-weight: 500;
        color: #333;
        margin-bottom: 2px;
        word-break: break-all;

        .schedule-tag {
          display: inline-block;
          background: #1890ff;
          color: white;
          padding: 0 4px;
          border-radius: 2px;
          font-size: 10px;
          margin-right: 4px;
        }
      }

      .schedule-detail {
        font-size: 11px;
        color: #999;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
