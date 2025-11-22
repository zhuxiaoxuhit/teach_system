import request from '../utils/request'

export interface Student {
  id: string
  name: string
  gender: string
  phone: string
  parentPhone: string
  status: string
  campusId: string
  campusName: string
  balance: number
  isFollowed: boolean
  createdAt: string
}

export interface StudentQuery {
  name?: string
  phone?: string
  status?: string
  campusId?: string
  page: number
  pageSize: number
}

export function getStudentList(params: StudentQuery) {
  return request({
    url: '/students',
    method: 'get',
    params
  })
}

export function getStudentDetail(id: string) {
  return request({
    url: `/students/${id}`,
    method: 'get'
  })
}

export function createStudent(data: Partial<Student>) {
  return request({
    url: '/students',
    method: 'post',
    data
  })
}

export function updateStudent(id: string, data: Partial<Student>) {
  return request({
    url: `/students/${id}`,
    method: 'put',
    data
  })
}

export function deleteStudent(id: string) {
  return request({
    url: `/students/${id}`,
    method: 'delete'
  })
}
