import request from '@/utils/request'

export interface Schedule {
  id?: number
  class_id?: number
  student_id?: number
  course_id?: number
  course_name?: string
  teacher_id?: number
  teacher_name?: string
  classroom?: string
  schedule_date: string
  start_time: string
  end_time: string
  week_day?: number
  schedule_type?: 'class' | 'onetoone'
  status?: 'normal' | 'cancelled' | 'conflict'
  remark?: string
  class_code?: string
  student_name?: string
  created_at?: string
  updated_at?: string
}

export interface TimetableParams {
  viewType: 'time' | 'class' | 'teacher' | 'classroom'
  startDate: string
  endDate: string
  campus?: string
  classId?: number
  teacherName?: string
  classroom?: string
}

export interface ConflictParams {
  startDate: string
  endDate: string
}

// 获取排课列表
export const getSchedules = (params: any) => {
  return request.get('/schedules', { params })
}

// 获取课程表数据
export const getTimetable = (params: TimetableParams) => {
  return request.get('/schedules/timetable', { params })
}

// 获取冲突日程
export const getConflicts = (params: ConflictParams) => {
  return request.get('/schedules/conflicts', { params })
}

// 创建排课
export const createSchedule = (data: Schedule) => {
  return request.post('/schedules', data)
}

// 批量导入一对一排课
export const importOneToOne = (data: { schedules: Schedule[] }) => {
  return request.post('/schedules/import-onetoone', data)
}

// 更新排课
export const updateSchedule = (id: number, data: Partial<Schedule>) => {
  return request.put(`/schedules/${id}`, data)
}

// 删除排课
export const deleteSchedule = (id: number) => {
  return request.delete(`/schedules/${id}`)
}

// 取消排课
export const cancelSchedule = (id: number) => {
  return request.post(`/schedules/${id}/cancel`)
}

// 获取教师列表
export const getTeachers = () => {
  return request.get('/schedules/teachers/list')
}

// 获取课程列表
export const getCourses = () => {
  return request.get('/schedules/courses/list')
}
