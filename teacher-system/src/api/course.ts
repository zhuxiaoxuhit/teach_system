import request from '../utils/request'

export interface Course {
  id?: number
  name: string
  category_id?: number
  category_name?: string
  teaching_mode: string
  charge_mode: string
  charge_unit: string
  price: number
  campus?: string
  duration: number
  total_lessons: number
  status: string
  remark?: string
  created_at?: string
  updated_at?: string
}

export interface CourseCategory {
  id: number
  name: string
  parent_id?: number
  sort_order: number
}

export function getCourseList(params: any) {
  return request({
    url: '/courses',
    method: 'get',
    params
  })
}

export function getCourseDetail(id: number) {
  return request({
    url: `/courses/${id}`,
    method: 'get'
  })
}

export function createCourse(data: Partial<Course>) {
  return request({
    url: '/courses',
    method: 'post',
    data
  })
}

export function updateCourse(id: number, data: Partial<Course>) {
  return request({
    url: `/courses/${id}`,
    method: 'put',
    data
  })
}

export function deleteCourse(id: number) {
  return request({
    url: `/courses/${id}`,
    method: 'delete'
  })
}

export function importCourses(formData: FormData) {
  return request({
    url: '/courses/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function getCourseCategories() {
  return request({
    url: '/courses/categories/list',
    method: 'get'
  })
}

export function createCourseCategory(data: Partial<CourseCategory>) {
  return request({
    url: '/courses/categories',
    method: 'post',
    data
  })
}

export function updateCourseCategory(id: number, data: Partial<CourseCategory>) {
  return request({
    url: `/courses/categories/${id}`,
    method: 'put',
    data
  })
}

export function deleteCourseCategory(id: number) {
  return request({
    url: `/courses/categories/${id}`,
    method: 'delete'
  })
}

// 升期关系接口
export interface CourseUpgradeRelation {
  id?: number
  name: string
  description?: string
  details?: CourseUpgradeDetail[]
  period_count?: number
  course_count?: number
  created_at?: string
}

export interface CourseUpgradeDetail {
  id?: number
  relation_id?: number
  period_number: number
  course_id: number
  course_name?: string
}

export function getCourseUpgradeList(params: any) {
  return request({
    url: '/course-upgrades',
    method: 'get',
    params
  })
}

export function getCourseUpgradeDetail(id: number) {
  return request({
    url: `/course-upgrades/${id}`,
    method: 'get'
  })
}

export function createCourseUpgrade(data: Partial<CourseUpgradeRelation>) {
  return request({
    url: '/course-upgrades',
    method: 'post',
    data
  })
}

export function updateCourseUpgrade(id: number, data: Partial<CourseUpgradeRelation>) {
  return request({
    url: `/course-upgrades/${id}`,
    method: 'put',
    data
  })
}

export function deleteCourseUpgrade(id: number) {
  return request({
    url: `/course-upgrades/${id}`,
    method: 'delete'
  })
}
