import apiClient from './rails-api'
import type { Office } from '../types'

export const getOffice = () =>
    apiClient.get<Office>('/admin/office')

export const updateOffice = (office: Pick<Office, 'name' | 'monthly_day_off_limit' | 'request_deadline_day'>) =>
    apiClient.patch<Office>('/admin/office', { office })
