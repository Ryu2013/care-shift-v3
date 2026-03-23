import apiClient from './rails-api'
import type { DayOffMonth, EmployeeDayOffMonthResponse } from '../types'

export const getEmployeeDayOffMonth = (target_month: string) =>
  apiClient.get<EmployeeDayOffMonthResponse>('/employee/day_off_months', { params: { target_month } })

export const saveEmployeeDayOffMonth = (target_month: string, request_dates: string[]) =>
  apiClient.post<DayOffMonth>('/employee/day_off_months', {
    target_month,
    day_off_month: { request_dates }
  })

export const getAdminDayOffMonths = (params: { target_month: string; team_id?: number }) =>
  apiClient.get<DayOffMonth[]>('/admin/day_off_months', { params })
