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
