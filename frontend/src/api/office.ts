import apiClient from './rails-api'
import type { Office } from '../types'

export const getOffice = () =>
    apiClient.get<Office>('/admin/office')

export const updateOffice = (name: string) =>
    apiClient.patch<Office>('/admin/office', { office: { name } })
