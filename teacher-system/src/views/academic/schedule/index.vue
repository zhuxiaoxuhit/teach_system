<template>
  <div class="schedule-container">
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="排课" name="timetable"></el-tab-pane>
        <el-tab-pane label="课程表" name="view"></el-tab-pane>
        <el-tab-pane label="日程列表" name="list"></el-tab-pane>
        <el-tab-pane label="冲突日程" name="conflict"></el-tab-pane>
      </el-tabs>

      <div class="schedule-header">
        <div class="header-left">
          <el-button-group>
            <el-button type="primary">新建排课</el-button>
            <el-button>一对一排课</el-button>
          </el-button-group>
          <el-select v-model="viewType" style="width: 120px;">
            <el-option label="校区" value="campus"></el-option>
            <el-option label="教师" value="teacher"></el-option>
            <el-option label="教室" value="classroom"></el-option>
          </el-select>
          <el-select v-model="selectedCampus" style="width: 150px;">
            <el-option label="校区:全部" value=""></el-option>
            <el-option label="魏桥书院" value="1"></el-option>
          </el-select>
          <el-button icon="Setting">展示设置</el-button>
        </div>

        <div class="header-right">
          <el-button-group>
            <el-button>周视图</el-button>
            <el-button>日程视图</el-button>
          </el-button-group>
          <el-date-picker
            v-model="currentDate"
            type="week"
            format="YYYY 第 WW 周"
            placeholder="选择周"
          />
          <el-button-group>
            <el-button icon="ArrowLeft" @click="prevWeek"></el-button>
            <el-button>今</el-button>
            <el-button icon="ArrowRight" @click="nextWeek"></el-button>
          </el-button-group>
          <el-button icon="Search">课表查询</el-button>
        </div>
      </div>

      <div class="schedule-legend">
        <span class="legend-item">
          <span class="legend-dot" style="background: #1890ff;"></span>
          已开始上 <el-icon><Clock /></el-icon>
        </span>
        <span class="legend-item">
          <span class="legend-dot" style="background: #52c41a;"></span>
          未开始
        </span>
        <span class="legend-item">
          <span class="legend-dot" style="background: #faad14;"></span>
          取消试点
        </span>
        <span class="legend-item">
          <span class="legend-dot" style="background: #f5222d;"></span>
          请假申请
        </span>
        <span class="legend-item">
          <span class="legend-dot" style="background: #722ed1;"></span>
          冲突提醒
        </span>
      </div>

      <div class="schedule-calendar">
        <div class="calendar-header">
          <div class="time-column">时间</div>
          <div class="day-column" v-for="day in weekDays" :key="day.date">
            <div class="day-name">{{ day.name }}</div>
            <div class="day-date">{{ day.date }}</div>
          </div>
        </div>

        <div class="calendar-body">
          <div class="time-slots">
            <div class="time-slot" v-for="time in timeSlots" :key="time">{{ time }}</div>
          </div>
          <div class="day-schedules">
            <div class="day-schedule" v-for="day in weekDays" :key="day.date">
              <div class="schedule-slot" v-for="time in timeSlots" :key="time">
                <div
                  v-for="(course, index) in getCoursesForSlot(day.date, time)"
                  :key="index"
                  class="course-item"
                  :class="course.status"
                >
                  <div class="course-time">{{ course.time }}</div>
                  <div class="course-info">
                    <div class="course-name">{{ course.name }}</div>
                    <div class="course-teacher">{{ course.teacher }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'

dayjs.extend(weekOfYear)

const activeTab = ref('view')
const viewType = ref('campus')
const selectedCampus = ref('')
const currentDate = ref(new Date())

const weekDays = computed(() => {
  const start = dayjs(currentDate.value).startOf('week')
  return Array.from({ length: 7 }, (_, i) => {
    const date = start.add(i, 'day')
    return {
      name: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][i],
      date: date.format('MM-DD')
    }
  })
})

const timeSlots = [
  '早 7:00',
  '上午 9:00',
  '上午 10:00',
  '上午 11:00',
  '上午 12:00',
  '下午 13:00',
  '下午 14:00',
  '下午 15:00',
  '下午 16:00',
  '下午 17:00',
  '晚间 18:00',
  '晚间 19:00',
  '晚间 20:00',
  '晚间 21:00'
]

const mockCourses = ref([
  {
    date: '11-17',
    time: '上午 9:00',
    name: '05-农小硬笔瑜伽班',
    teacher: '文琴琴',
    status: 'started'
  },
  {
    date: '11-18',
    time: '下午 14:00',
    name: '农小-农小学科-14:00',
    teacher: '张老师',
    status: 'upcoming'
  },
  {
    date: '11-19',
    time: '下午 16:00',
    name: '05-农小硬笔-16:00-18:10',
    teacher: '梁老师',
    status: 'upcoming'
  },
  {
    date: '11-23',
    time: '下午 14:00',
    name: '农小-农小硬笔暑托',
    teacher: '杨倩',
    status: 'upcoming'
  }
])

const getCoursesForSlot = (date: string, time: string) => {
  return mockCourses.value.filter(c => c.date === date && c.time === time)
}

const prevWeek = () => {
  currentDate.value = dayjs(currentDate.value).subtract(1, 'week').toDate()
}

const nextWeek = () => {
  currentDate.value = dayjs(currentDate.value).add(1, 'week').toDate()
}
</script>

<style scoped lang="scss">
.schedule-container {
  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;

    .header-left,
    .header-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .schedule-legend {
    display: flex;
    gap: 20px;
    margin-bottom: 16px;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;

      .legend-dot {
        width: 10px;
        height: 10px;
        border-radius: 2px;
      }
    }
  }

  .schedule-calendar {
    border: 1px solid #e8e8e8;
    border-radius: 4px;

    .calendar-header {
      display: grid;
      grid-template-columns: 100px repeat(7, 1fr);
      background-color: #fafafa;
      border-bottom: 1px solid #e8e8e8;

      .time-column {
        padding: 12px;
        font-weight: 500;
        border-right: 1px solid #e8e8e8;
      }

      .day-column {
        padding: 12px;
        text-align: center;
        border-right: 1px solid #e8e8e8;

        &:last-child {
          border-right: none;
        }

        .day-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .day-date {
          font-size: 12px;
          color: #999;
        }
      }
    }

    .calendar-body {
      display: grid;
      grid-template-columns: 100px 1fr;

      .time-slots {
        border-right: 1px solid #e8e8e8;

        .time-slot {
          height: 80px;
          padding: 8px;
          border-bottom: 1px solid #e8e8e8;
          font-size: 12px;
          color: #666;
        }
      }

      .day-schedules {
        display: grid;
        grid-template-columns: repeat(7, 1fr);

        .day-schedule {
          border-right: 1px solid #e8e8e8;

          &:last-child {
            border-right: none;
          }

          .schedule-slot {
            height: 80px;
            border-bottom: 1px solid #e8e8e8;
            padding: 4px;
            position: relative;

            .course-item {
              background-color: #1890ff;
              color: white;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 12px;
              margin-bottom: 4px;
              cursor: pointer;

              &.started {
                background-color: #1890ff;
              }

              &.upcoming {
                background-color: #52c41a;
              }

              &.cancelled {
                background-color: #faad14;
              }

              .course-time {
                font-size: 10px;
                opacity: 0.9;
              }

              .course-info {
                margin-top: 2px;

                .course-name {
                  font-weight: 500;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .course-teacher {
                  font-size: 10px;
                  opacity: 0.9;
                  margin-top: 2px;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
