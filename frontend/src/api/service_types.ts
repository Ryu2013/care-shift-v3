import apiClient from './rails-api'
import type { ServiceType } from '../types'

export const getOfficeServiceTypes = () =>
  apiClient.get<ServiceType[]>('/service_types')

export const getAdminServiceTypes = () =>
  apiClient.get<ServiceType[]>('/admin/service_types')

export const createServiceType = (name: string) =>
  apiClient.post<ServiceType>('/admin/service_types', { service_type: { name } })

export const updateServiceType = (id: number, name: string) =>
  apiClient.patch<ServiceType>(`/admin/service_types/${id}`, { service_type: { name } })

export const deleteServiceType = (id: number) =>
  apiClient.delete(`/admin/service_types/${id}`)
