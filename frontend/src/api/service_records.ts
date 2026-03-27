import apiClient from './rails-api'
import type { ServiceRecord, ServiceRecordInput } from '../types'

function appendServiceRecordValue(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return

  if (value instanceof File) {
    formData.append(key, value)
    return
  }

  formData.append(key, String(value))
}

function buildServiceRecordFormData(data: Partial<ServiceRecordInput>) {
  const formData = new FormData()
  const entries = Object.entries(data)

  for (let index = 0; index < entries.length; index += 1) {
    const [key, value] = entries[index]
    appendServiceRecordValue(formData, `service_record[${key}]`, value)
  }

  return formData
}

export const getAdminServiceRecords = (params: {
  date?: string
  team_id?: number
  client_id?: number
  user_id?: number
  service_type_id?: number
}) =>
  apiClient.get<ServiceRecord[]>('/admin/service_records', { params })

export const updateAdminServiceRecord = (id: number, data: Partial<ServiceRecordInput>) =>
  apiClient.patch<ServiceRecord>(`/admin/service_records/${id}`, buildServiceRecordFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const getEmployeeServiceRecords = (params: { date?: string }) =>
  apiClient.get<ServiceRecord[]>('/employee/service_records', { params })

export const createEmployeeServiceRecord = (data: ServiceRecordInput) =>
  apiClient.post<ServiceRecord>('/employee/service_records', buildServiceRecordFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' }
  })

export const updateEmployeeServiceRecord = (id: number, data: Partial<ServiceRecordInput>) =>
  apiClient.patch<ServiceRecord>(`/employee/service_records/${id}`, buildServiceRecordFormData(data), {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
