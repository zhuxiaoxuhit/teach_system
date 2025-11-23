import request from '../utils/request'

export function getRecruitmentStats(params?: any) {
  return request({
    url: '/statistics/recruitment',
    method: 'get',
    params
  })
}

export function getAcademicStats(params?: any) {
  return request({
    url: '/statistics/academic',
    method: 'get',
    params
  })
}

export function getFinanceStats(params?: any) {
  return request({
    url: '/statistics/finance',
    method: 'get',
    params
  })
}

export function getDashboardStats() {
  return request({
    url: '/statistics/dashboard',
    method: 'get'
  })
}
