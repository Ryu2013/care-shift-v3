import apiClient from './rails-api'
import type { Office } from '../types'

export const getOffice = () =>
    apiClient.get<Office>('/office')

export const updateOffice = (name: string) =>
    apiClient.patch<Office>('/office', { office: { name } })
