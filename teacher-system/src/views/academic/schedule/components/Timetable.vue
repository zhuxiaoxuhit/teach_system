<template>
  <div class="timetable-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="showCreateDialog = true">新建排课</el-button>
        <el-button @click="showImportDialog = true">一对一排课导入</el-button>
        <el-select v-model="filters.campus" placeholder="校区" style="width: 150px" clearable>
          <el-option label="魏桥书院" value="魏桥书院" />
        </el-select>
        <el-select v-model="filters.classId" placeholder="班级" style="width: 200px" clearable>
          <el-option
            v-for="cls in classList"
            :key="cls.id"
            :label="cls.code"
            :value="cls.id"
          />
        </el-select>
        <el-select v-model="filters.teacherName" placeholder="教师" style="width: 150px" clearable>
          <el-option
            v-for="teacher in teacherList"
            :key="teacher.id"
            :label="teacher.name"
            :value="teacher.name"
          />
        </el-select>
        <el-select v-model="filters.classroom" placeholder="教室" style="width: 150px" clearable>
          <el-option label="1F教室1" value="1F教室1" />
          <el-option label="1F教室2" value="1F教室2" />
          <el-option label="2F教室1" value="2F教室1" />
        </el-select>
      </div>
      <div class="toolbar-right">
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
        <el-button @click="loadTimetable">清空筛选</el-button>
      </div>
    </div>

    <!-- 视图切换和日期选择 -->
    <div class="view-control">
      <div class="view-tabs">
        <el-radio-group v-model="viewType" @change="loadTimetable">
          <el-radio-button label="time">时间课表视图</el-radio-button>
          <el-radio-button label="class">班级课表视图</el-radio-button>
          <el-radio-button label="teacher">教师课表视图</el-radio-button>
          <el-radio-button label="classroom">教室课表视图</el-radio-button>
        </el-radio-group>
      </div>
      <div class="date-control">
        <el-button-group>
          <el-button icon="ArrowLeft" @click="prevWeek" />
          <el-button @click="goToday">今</el-button>
          <el-button icon="ArrowRight" @click="nextWeek" />
        </el-button-group>
        <el-date-picker
          v-model="currentDate"
          type="week"
          format="YYYY年 第WW周"
          @change="loadTimetable"
        />
        <span class="date-range">{{ dateRangeText }}</span>
      </div>
    </div>

    <!-- 图例说明 -->
    <div class="legend">
      <span class="legend-item">
        <span class="legend-color" style="background: #1890ff"></span>已开始上课
      </span>
      <span class="legend-item">
        <span class="legend-color" style="background: #52c41a"></span>未开始
      </span>
      <span class="legend-item">
        <span class="legend-color" style="background: #faad14"></span>取消试点
      </span>
      <span class="legend-item">
        <span class="legend-color" style="background: #722ed1"></span>冲突日程
      </span>
      <span class="legend-item">
        含有冲突的课表
      </span>
    </div>

    <!-- 课程表内容 -->
    <div v-loading="loading" class="timetable-content">
      <!-- 时间视图 -->
      <div v-if="viewType === 'time'" class="time-view">
        <div class="calendar-grid">
          <div class="calendar-header">
            <div class="time-column-header">时间</div>
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="day-column-header"
            >
              <div class="day-name">{{ day.weekday }}</div>
              <div class="day-date">{{ day.dateStr }}</div>
            </div>
          </div>
          <div class="calendar-body">
            <div class="time-column">
              <div
                v-for="timeSlot in timeSlots"
                :key="timeSlot"
                class="time-slot"
              >
                {{ timeSlot }}
              </div>
            </div>
            <div class="schedule-grid">
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="day-column"
              >
                <div
                  v-for="timeSlot in timeSlots"
                  :key="timeSlot"
                  class="schedule-cell"
                >
                  <div
                    v-for="schedule in getSchedulesForTimeSlot(day.date, timeSlot)"
                    :key="schedule.id"
                    class="schedule-item"
                    :class="getScheduleClass(schedule)"
                    @click="handleScheduleClick(schedule)"
                  >
                    <div class="schedule-time">
                      {{ formatTime(schedule.start_time) }}-{{ formatTime(schedule.end_time) }}
                    </div>
                    <div class="schedule-course">{{ schedule.course_name }}</div>
                    <div class="schedule-info">
                      <span>{{ schedule.teacher_name }}</span>
                      <span v-if="schedule.classroom">{{ schedule.classroom }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 班级视图 -->
      <div v-if="viewType === 'class'" class="class-view">
        <div class="view-grid">
          <div class="grid-header">
            <div class="row-header-column">班级</div>
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="day-column-header"
            >
              {{ day.weekday }} {{ day.dateStr }}
            </div>
          </div>
          <div class="grid-body">
            <div
              v-for="(schedules, className) in groupedByClass"
              :key="className"
              class="grid-row"
            >
              <div class="row-header">{{ className }}</div>
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="day-cell"
              >
                <div
                  v-for="schedule in getSchedulesForClassDay(schedules, day.date)"
                  :key="schedule.id"
                  class="schedule-item"
                  :class="getScheduleClass(schedule)"
                  @click="handleScheduleClick(schedule)"
                >
                  <div class="schedule-time">
                    {{ formatTime(schedule.start_time) }}-{{ formatTime(schedule.end_time) }}
                  </div>
                  <div class="schedule-course">{{ schedule.course_name }}</div>
                  <div class="schedule-classroom">{{ schedule.classroom }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教师视图 -->
      <div v-if="viewType === 'teacher'" class="teacher-view">
        <div class="view-grid">
          <div class="grid-header">
            <div class="row-header-column">教师</div>
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="day-column-header"
            >
              {{ day.weekday }} {{ day.dateStr }}
            </div>
          </div>
          <div class="grid-body">
            <div
              v-for="(schedules, teacherName) in groupedByTeacher"
              :key="teacherName"
              class="grid-row"
            >
              <div class="row-header">{{ teacherName }}</div>
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="day-cell"
              >
                <div
                  v-for="schedule in getSchedulesForDay(schedules, day.date)"
                  :key="schedule.id"
                  class="schedule-item"
                  :class="getScheduleClass(schedule)"
                  @click="handleScheduleClick(schedule)"
                >
                  <div class="schedule-time">
                    {{ formatTime(schedule.start_time) }}-{{ formatTime(schedule.end_time) }}
                  </div>
                  <div class="schedule-course">{{ schedule.course_name }}</div>
                  <div class="schedule-classroom">{{ schedule.classroom }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 教室视图 -->
      <div v-if="viewType === 'classroom'" class="classroom-view">
        <div class="view-grid">
          <div class="grid-header">
            <div class="row-header-column">教室</div>
            <div
              v-for="day in weekDays"
              :key="day.date"
              class="day-column-header"
            >
              {{ day.weekday }} {{ day.dateStr }}
            </div>
          </div>
          <div class="grid-body">
            <div
              v-for="(schedules, classroomName) in groupedByClassroom"
              :key="classroomName"
              class="grid-row"
            >
              <div class="row-header">{{ classroomName }}</div>
              <div
                v-for="day in weekDays"
                :key="day.date"
                class="day-cell"
              >
                <div
                  v-for="schedule in getSchedulesForDay(schedules, day.date)"
                  :key="schedule.id"
                  class="schedule-item"
                  :class="getScheduleClass(schedule)"
                  @click="handleScheduleClick(schedule)"
                >
                  <div class="schedule-time">
                    {{ formatTime(schedule.start_time) }}-{{ formatTime(schedule.end_time) }}
                  </div>
                  <div class="schedule-course">{{ schedule.course_name }}</div>
                  <div class="schedule-teacher">{{ schedule.teacher_name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建排课对话框 -->
    <CreateScheduleDialog
      v-model="showCreateDialog"
      @success="loadTimetable"
    />

    <!-- 一对一导入对话框 -->
    <ImportOneToOneDialog
      v-model="showImportDialog"
      @success="loadTimetable"
    />

    <!-- 排课详情对话框 -->
    <ScheduleDetailDialog
      v-model="showDetailDialog"
      :schedule="selectedSchedule"
      @update="loadTimetable"
      @delete="loadTimetable"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { getTimetable } from '@/api/schedules'
import { getClasses } from '@/api/classes'
import { getTeachers } from '@/api/schedules'
import CreateScheduleDialog from './CreateScheduleDialog.vue'
import ImportOneToOneDialog from './ImportOneToOneDialog.vue'
import ScheduleDetailDialog from './ScheduleDetailDialog.vue'

dayjs.extend(weekOfYear)

const loading = ref(false)
const viewType = ref('time')
const currentDate = ref(new Date())
const searchKeyword = ref('')
const showCreateDialog = ref(false)
const showImportDialog = ref(false)
const showDetailDialog = ref(false)
const selectedSchedule = ref(null)

const filters = ref({
  campus: '',
  classId: null,
  teacherName: '',
  classroom: ''
})

const classList = ref([])
const teacherList = ref([])
const scheduleData = ref<any>({})

// 时间段配置
const timeSlots = [
  '早 7:00', '早 8:00', '上午 9:00', '上午 10:00', '上午 11:00', '上午 12:00',
  '下午 13:00', '下午 14:00', '下午 15:00', '下午 16:00', '下午 17:00',
  '晚间 18:00', '晚间 19:00', '晚间 20:00', '晚间 21:00'
]

// 计算当前周的日期
const weekDays = computed(() => {
  const start = dayjs(currentDate.value).startOf('week')
  return Array.from({ length: 7 }, (_, i) => {
    const date = start.add(i, 'day')
    return {
      weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][i],
      date: date.format('YYYY-MM-DD'),
      dateStr: date.format('MM月DD日')
    }
  })
})

// 日期范围文本
const dateRangeText = computed(() => {
  const start = weekDays.value[0]
  const end = weekDays.value[6]
  return `${start.dateStr} - ${end.dateStr}`
})

// 按班级分组
const groupedByClass = computed(() => {
  const grouped: any = {}
  Object.values(scheduleData.value).forEach((schedules: any) => {
    schedules.forEach((schedule: any) => {
      const key = schedule.class_code || `一对一-${schedule.student_name}`
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(schedule)
    })
  })
  return grouped
})

// 按教师分组
const groupedByTeacher = computed(() => {
  const grouped: any = {}
  Object.values(scheduleData.value).forEach((schedules: any) => {
    schedules.forEach((schedule: any) => {
      const key = schedule.teacher_name || '未分配'
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(schedule)
    })
  })
  return grouped
})

// 按教室分组
const groupedByClassroom = computed(() => {
  const grouped: any = {}
  Object.values(scheduleData.value).forEach((schedules: any) => {
    schedules.forEach((schedule: any) => {
      const key = schedule.classroom || '未分配'
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(schedule)
    })
  })
  return grouped
})

// 加载课程表数据
const loadTimetable = async () => {
  loading.value = true
  try {
    const startDate = weekDays.value[0].date
    const endDate = weekDays.value[6].date

    const params = {
      viewType: viewType.value,
      startDate,
      endDate,
      ...filters.value
    }

    const res = await getTimetable(params)
    if (res.code === 200) {
      scheduleData.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载课程表失败')
  } finally {
    loading.value = false
  }
}

// 加载班级列表
const loadClasses = async () => {
  try {
    const res = await getClasses({ pageSize: 1000 })
    if (res.code === 200) {
      classList.value = res.data.list
    }
  } catch (error) {
    console.error('加载班级列表失败', error)
  }
}

// 加载教师列表
const loadTeachers = async () => {
  try {
    const res = await getTeachers()
    if (res.code === 200) {
      teacherList.value = res.data
    }
  } catch (error) {
    console.error('加载教师列表失败', error)
  }
}

// 获取时间段的排课
const getSchedulesForTimeSlot = (date: string, timeSlot: string) => {
  const schedules = scheduleData.value[date] || []
  const hour = parseInt(timeSlot.match(/\d+/)?.[0] || '0')

  return schedules.filter((s: any) => {
    const startHour = parseInt(s.start_time?.split(':')[0] || '0')
    return startHour === hour
  })
}

// 获取班级某天的排课
const getSchedulesForClassDay = (schedules: any[], date: string) => {
  return schedules.filter(s => s.schedule_date === date)
}

// 获取某天的排课
const getSchedulesForDay = (schedules: any[], date: string) => {
  return schedules.filter(s => s.schedule_date === date)
}

// 获取排课样式类
const getScheduleClass = (schedule: any) => {
  const classes = []
  if (schedule.status === 'conflict') {
    classes.push('conflict')
  } else if (schedule.status === 'cancelled') {
    classes.push('cancelled')
  } else {
    const now = dayjs()
    const scheduleTime = dayjs(`${schedule.schedule_date} ${schedule.start_time}`)
    if (scheduleTime.isBefore(now)) {
      classes.push('started')
    } else {
      classes.push('upcoming')
    }
  }
  return classes
}

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return ''
  return time.substring(0, 5)
}

// 点击排课
const handleScheduleClick = (schedule: any) => {
  selectedSchedule.value = schedule
  showDetailDialog.value = true
}

// 上一周
const prevWeek = () => {
  currentDate.value = dayjs(currentDate.value).subtract(1, 'week').toDate()
  loadTimetable()
}

// 下一周
const nextWeek = () => {
  currentDate.value = dayjs(currentDate.value).add(1, 'week').toDate()
  loadTimetable()
}

// 回到今天
const goToday = () => {
  currentDate.value = new Date()
  loadTimetable()
}

onMounted(() => {
  loadClasses()
  loadTeachers()
  loadTimetable()
})
</script>

<style scoped lang="scss">
.timetable-container {
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

  .view-control {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    .date-control {
      display: flex;
      gap: 12px;
      align-items: center;

      .date-range {
        color: #666;
        font-size: 14px;
      }
    }
  }

  .legend {
    display: flex;
    gap: 20px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;
    flex-wrap: wrap;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }
    }
  }

  .timetable-content {
    min-height: 400px;
  }

  // 时间视图样式
  .time-view {
    .calendar-grid {
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      overflow: hidden;

      .calendar-header {
        display: grid;
        grid-template-columns: 100px repeat(7, 1fr);
        background: #fafafa;
        border-bottom: 1px solid #e8e8e8;

        .time-column-header,
        .day-column-header {
          padding: 12px;
          text-align: center;
          border-right: 1px solid #e8e8e8;
          font-weight: 500;

          &:last-child {
            border-right: none;
          }
        }

        .day-column-header {
          .day-name {
            margin-bottom: 4px;
          }

          .day-date {
            font-size: 12px;
            color: #999;
            font-weight: normal;
          }
        }
      }

      .calendar-body {
        display: grid;
        grid-template-columns: 100px 1fr;

        .time-column {
          border-right: 1px solid #e8e8e8;

          .time-slot {
            height: 80px;
            padding: 8px;
            border-bottom: 1px solid #e8e8e8;
            font-size: 12px;
            color: #666;
            display: flex;
            align-items: center;

            &:last-child {
              border-bottom: none;
            }
          }
        }

        .schedule-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);

          .day-column {
            border-right: 1px solid #e8e8e8;

            &:last-child {
              border-right: none;
            }

            .schedule-cell {
              height: 80px;
              padding: 4px;
              border-bottom: 1px solid #e8e8e8;

              &:last-child {
                border-bottom: none;
              }
            }
          }
        }
      }
    }
  }

  // 班级/教师/教室视图样式
  .class-view,
  .teacher-view,
  .classroom-view {
    .view-grid {
      border: 1px solid #e8e8e8;
      border-radius: 4px;
      overflow: hidden;

      .grid-header {
        display: grid;
        grid-template-columns: 150px repeat(7, 1fr);
        background: #fafafa;
        border-bottom: 1px solid #e8e8e8;

        .row-header-column,
        .day-column-header {
          padding: 12px;
          text-align: center;
          border-right: 1px solid #e8e8e8;
          font-weight: 500;
          font-size: 14px;

          &:last-child {
            border-right: none;
          }
        }
      }

      .grid-body {
        .grid-row {
          display: grid;
          grid-template-columns: 150px repeat(7, 1fr);
          border-bottom: 1px solid #e8e8e8;

          &:last-child {
            border-bottom: none;
          }

          .row-header {
            padding: 12px;
            border-right: 1px solid #e8e8e8;
            font-weight: 500;
            display: flex;
            align-items: center;
            background: #fafafa;
          }

          .day-cell {
            padding: 8px;
            border-right: 1px solid #e8e8e8;
            min-height: 80px;

            &:last-child {
              border-right: none;
            }
          }
        }
      }
    }
  }

  // 排课项样式
  .schedule-item {
    padding: 6px 8px;
    border-radius: 4px;
    margin-bottom: 4px;
    cursor: pointer;
    font-size: 12px;
    color: #fff;
    transition: all 0.2s;

    &:hover {
      opacity: 0.8;
      transform: translateY(-1px);
    }

    &.started {
      background: #1890ff;
    }

    &.upcoming {
      background: #52c41a;
    }

    &.cancelled {
      background: #faad14;
    }

    &.conflict {
      background: #722ed1;
    }

    .schedule-time {
      font-size: 11px;
      opacity: 0.9;
      margin-bottom: 2px;
    }

    .schedule-course {
      font-weight: 500;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .schedule-info,
    .schedule-classroom,
    .schedule-teacher {
      font-size: 11px;
      opacity: 0.9;
      display: flex;
      gap: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
