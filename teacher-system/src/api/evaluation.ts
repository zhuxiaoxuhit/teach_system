import request from '../utils/request'

export interface Evaluation {
  id: string
  record_id: string
  student_id: string
  content: string
  images: string
  red_dots: number
  is_read: boolean
  created_by: string
  created_at: string
}

export function getEvaluationsByRecord(recordId: string, params: any) {
  return request({
    url: `/evaluations/record/${recordId}`,
    method: 'get',
    params
  })
}

export function getEvaluationsByStudent(studentId: string, params: any) {
  return request({
    url: `/evaluations/student/${studentId}`,
    method: 'get',
    params
  })
}

export function createEvaluation(data: Partial<Evaluation>) {
  return request({
    url: '/evaluations',
    method: 'post',
    data
  })
}

export function batchCreateEvaluation(data: any) {
  return request({
    url: '/evaluations/batch',
    method: 'post',
    data
  })
}

export function updateEvaluation(id: string, data: Partial<Evaluation>) {
  return request({
    url: `/evaluations/${id}`,
    method: 'put',
    data
  })
}

export function markAsRead(id: string) {
  return request({
    url: `/evaluations/${id}/read`,
    method: 'post'
  })
}

export function deleteEvaluation(id: string) {
  return request({
    url: `/evaluations/${id}`,
    method: 'delete'
  })
}
