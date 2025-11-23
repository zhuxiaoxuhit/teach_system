import request from '../utils/request'

// 获取分班操作日志列表
export function getAssignmentLogs(params: any) {
  return request({
    url: '/class-assignments',
    method: 'get',
    params
  })
}

// 获取单个学员的分班历史
export function getStudentAssignmentHistory(studentId: string, params: any) {
  return request({
    url: `/class-assignments/student/${studentId}`,
    method: 'get',
    params
  })
}

// 获取班级的分班历史
export function getClassAssignmentHistory(classId: string, params: any) {
  return request({
    url: `/class-assignments/class/${classId}`,
    method: 'get',
    params
  })
}

// 导出分班日志
export function exportAssignmentLogs(params: any) {
  return request({
    url: '/class-assignments/export',
    method: 'get',
    params
  })
}
