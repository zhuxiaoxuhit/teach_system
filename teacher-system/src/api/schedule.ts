import request from '@/utils/request'

export interface Schedule {
  id?: number
  class_id: number
  course_id?: number
  classroom: string
  schedule_date: string
  start_time: string
  end_time: string
  duration: number
  schedule_type: string
  status: string
  campus: string
  remark?: string
  class_code?: string
  course_name?: string
}

export interface ScheduleQuery {
  page: number
  pageSize: number
  startDate?: string
  endDate?: string
  classId?: number
  classroom?: string
  scheduleType?: string
  status?: string
}

// 获取排课列表
export function getScheduleList(params: ScheduleQuery) {
  return request({
    url: '/schedules',
    method: 'get',
    params
  })
}

// 获取课程表数据
export function getTimetable(params: any) {
  return request({
    url: '/schedules/timetable',
    method: 'get',
    params
  })
}

// 获取冲突日程
export function getConflicts(params: any) {
  return request({
    url: '/schedules/conflicts',
    method: 'get',
    params
  })
}

// 创建排课
export function createSchedule(data: Partial<Schedule>) {
  return request({
    url: '/schedules',
    method: 'post',
    data
  })
}

// 更新排课
export function updateSchedule(id: number, data: Partial<Schedule>) {
  return request({
    url: `/schedules/${id}`,
    method: 'put',
    data
  })
}

// 删除排课
export function deleteSchedule(id: number) {
  return request({
    url: `/schedules/${id}`,
    method: 'delete'
  })
}

// 批量创建排课
export function batchCreateSchedule(data: any) {
  return request({
    url: '/schedules/batch',
    method: 'post',
    data
  })
}
