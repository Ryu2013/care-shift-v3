import apiClient from './client'
import type { Shift } from '../types'

export const getShifts = (params: { date?: string; client_id?: number }) =>
  apiClient.get<Shift[]>('/shifts', { params })

export const createShift = (data: Partial<Shift>) =>
  apiClient.post<Shift>('/shifts', { shift: data })

export const updateShift = (id: number, data: Partial<Shift>) =>
  apiClient.patch<Shift>(`/shifts/${id}`, { shift: data })

export const deleteShift = (id: number) =>
  apiClient.delete(`/shifts/${id}`)

export const generateMonthlyShifts = (client_id: number, date: string) =>
  apiClient.post<{ created: number }>('/shifts/generate_monthly', { client_id, date })
