import apiClient from './rails-api'
import type { Shift } from '../types'

export const getShifts = (params: { date?: string; client_id?: number }) =>
  apiClient.get<Shift[]>('/admin/shifts', { params })

export const getUserShifts = (params: { date?: string; user_id?: number }) =>
  apiClient.get<Shift[]>('/shifts', { params })

export const updateUserShiftStatus = (id: number, work_status: string) =>
  apiClient.patch<Shift>(`/shifts/${id}`, { shift: { work_status } })

export const createShift = (data: Partial<Shift>) =>
  apiClient.post<Shift>('/admin/shifts', { shift: data })

export const updateShift = (id: number, data: Partial<Shift>) =>
  apiClient.patch<Shift>(`/admin/shifts/${id}`, { shift: data })

export const deleteShift = (id: number) =>
  apiClient.delete(`/admin/shifts/${id}`)

export const generateMonthlyShifts = (client_id: number, date: string) =>
  apiClient.post<{ created: number }>('/admin/shifts/generate_monthly', { client_id, date })
