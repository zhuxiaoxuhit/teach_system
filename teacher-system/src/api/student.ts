import request from '../utils/request'

// ==================== 学员基础数据类型 ====================

export interface Student {
  id: string
  name: string
  gender: string
  relation: string
  phone: string
  birthday?: string
  campus: string
  is_followed: boolean
  card_bound: boolean
  rating: number
  balance: number
  status: string
  remark?: string
  created_at?: string
  updated_at?: string
}

export interface StudentQuery {
  keyword?: string
  status?: string
  campus?: string
  gender?: string
  relation?: string
  page: number
  pageSize: number
}

// ==================== 报读数据类型 ====================

export interface Enrollment {
  id?: number
  student_id: number
  student_name: string
  gender: string
  relation: string
  phone: string
  course_type: string
  course_name: string
  total_class_hours: number
  used_class_hours: number
  remaining_class_hours: number
  total_amount: number
  paid_amount: number
  discount_amount: number
  refund_amount: number
  balance: number
  campus: string
  status: string
  remark?: string
}

export interface EnrollmentQuery {
  keyword?: string
  campus?: string
  courseType?: string
  status?: string
  page: number
  pageSize: number
}

// ==================== 分班数据类型 ====================

export interface ClassAssignment {
  id?: number
  student_id: number
  student_name: string
  gender: string
  phone: string
  campus: string
  course_type: string
  course_name: string
  class_name: string
  classroom: string
  teacher: string
  schedule: string
  class_type: string
  enrollment_date: string
  start_date: string
  end_date: string
  status: string
  remark?: string
}

export interface ClassAssignmentQuery {
  keyword?: string
  campus?: string
  courseType?: string
  className?: string
  status?: string
  page: number
  pageSize: number
}

// ==================== 成绩数据类型 ====================

export interface Score {
  id?: number
  student_id: number
  student_name: string
  gender: string
  phone: string
  course_name: string
  class_name: string
  score: number
  exam_date: string
  exam_type: string
  campus: string
  class_count: number
  remark?: string
}

export interface ScoreQuery {
  keyword?: string
  courseName?: string
  className?: string
  examType?: string
  startDate?: string
  endDate?: string
  page: number
  pageSize: number
}

// ==================== 花名册 API ====================

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

export function importStudents(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/students/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ==================== 报读列表 API ====================

export function getEnrollmentList(params: EnrollmentQuery) {
  return request({
    url: '/students/enrollments',
    method: 'get',
    params
  })
}

export function createEnrollment(data: Partial<Enrollment>) {
  return request({
    url: '/students/enrollments',
    method: 'post',
    data
  })
}

export function updateEnrollment(id: number, data: Partial<Enrollment>) {
  return request({
    url: `/students/enrollments/${id}`,
    method: 'put',
    data
  })
}

export function deleteEnrollment(id: number) {
  return request({
    url: `/students/enrollments/${id}`,
    method: 'delete'
  })
}

// ==================== 分班列表 API ====================

export function getClassAssignmentList(params: ClassAssignmentQuery) {
  return request({
    url: '/students/class-assignments',
    method: 'get',
    params
  })
}

export function createClassAssignment(data: Partial<ClassAssignment>) {
  return request({
    url: '/students/class-assignments',
    method: 'post',
    data
  })
}

export function updateClassAssignment(id: number, data: Partial<ClassAssignment>) {
  return request({
    url: `/students/class-assignments/${id}`,
    method: 'put',
    data
  })
}

export function deleteClassAssignment(id: number) {
  return request({
    url: `/students/class-assignments/${id}`,
    method: 'delete'
  })
}

// ==================== 学员成绩 API ====================

export function getScoreList(params: ScoreQuery) {
  return request({
    url: '/students/scores',
    method: 'get',
    params
  })
}

export function createScore(data: Partial<Score>) {
  return request({
    url: '/students/scores',
    method: 'post',
    data
  })
}

export function updateScore(id: number, data: Partial<Score>) {
  return request({
    url: `/students/scores/${id}`,
    method: 'put',
    data
  })
}

export function deleteScore(id: number) {
  return request({
    url: `/students/scores/${id}`,
    method: 'delete'
  })
}
