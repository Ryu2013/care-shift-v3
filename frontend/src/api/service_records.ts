import apiClient from './rails-api'
import type { ServiceRecord } from '../types'

export interface ServiceRecordParams {
  shift_id?: number
  service_type_id: number
  is_first_visit: boolean
  is_emergency: boolean
  schedule_changed: boolean
  appearance_status: string
  has_sweating: boolean
  body_temperature: number | null
  systolic_bp: number | null
  diastolic_bp: number | null
  environment_preparation: boolean
  consultation_support: boolean
  information_collection_and_provision: boolean
  record_checked: boolean
  note: string | null
  submitted_at: string | null
}

export const getAdminServiceRecords = (params: {
  date?: string
  team_id?: number
  client_id?: number
  user_id?: number
  service_type_id?: number
}) =>
  apiClient.get<ServiceRecord[]>('/admin/service_records', { params })

export const updateAdminServiceRecord = (id: number, data: Partial<ServiceRecordParams>) =>
  apiClient.patch<ServiceRecord>(`/admin/service_records/${id}`, { service_record: data })

export const getEmployeeServiceRecords = (params: { date?: string }) =>
  apiClient.get<ServiceRecord[]>('/employee/service_records', { params })

export const createEmployeeServiceRecord = (data: ServiceRecordParams) =>
  apiClient.post<ServiceRecord>('/employee/service_records', { service_record: data })

export const updateEmployeeServiceRecord = (id: number, data: Partial<ServiceRecordParams>) =>
  apiClient.patch<ServiceRecord>(`/employee/service_records/${id}`, { service_record: data })
