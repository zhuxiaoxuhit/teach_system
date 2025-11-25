import request from '../utils/request'

export interface Class {
  id: string
  name: string
  code: string
  studentCount: number
  capacity: number
  teacherId: string
  teacherName: string
  courseId: string
  courseName: string
  classroomId: string
  classroomName: string
  startDate: string
  endDate: string
  status: string
}

export function getClassList(params: any) {
  return request({
    url: '/classes',
    method: 'get',
    params
  })
}

export function getClassDetail(id: string) {
  return request({
    url: `/classes/${id}`,
    method: 'get'
  })
}

export function createClass(data: Partial<Class>) {
  return request({
    url: '/classes',
    method: 'post',
    data
  })
}

export function updateClass(id: string, data: Partial<Class>) {
  return request({
    url: `/classes/${id}`,
    method: 'put',
    data
  })
}

export function deleteClass(id: string) {
  return request({
    url: `/classes/${id}`,
    method: 'delete'
  })
}

export function finishClass(id: string) {
  return request({
    url: `/classes/${id}/finish`,
    method: 'post'
  })
}

export function getClassRecords(classId: string, params: any) {
  return request({
    url: `/records/class/${classId}`,
    method: 'get',
    params
  })
}

export function createClassRecord(data: any) {
  return request({
    url: '/records',
    method: 'post',
    data
  })
}

// 批量导入班级
export function importClasses(formData: FormData) {
  return request({
    url: '/classes/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 批量分配学员到班级
export function assignStudents(classId: string, data: { studentIds: number[], operator?: string }) {
  return request({
    url: `/classes/${classId}/assign-students`,
    method: 'post',
    data
  })
}

// 移除学员出班
export function removeStudents(classId: string, data: { studentIds: number[], operator?: string, remark?: string }) {
  return request({
    url: `/classes/${classId}/remove-students`,
    method: 'post',
    data
  })
}

// 获取班级学员列表
export function getClassStudents(classId: string, params: any) {
  return request({
    url: `/classes/${classId}/students`,
    method: 'get',
    params
  })
}

// 获取导入记录列表
export function getImportRecords(params: any) {
  return request({
    url: '/classes/import-records',
    method: 'get',
    params
  })
}

