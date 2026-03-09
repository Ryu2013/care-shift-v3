import apiClient from './rails-api'
import type { ClientNeed } from '../types'

export const getClientNeeds = (client_id: number) =>
    apiClient.get<ClientNeed[]>('/admin/client_needs', { params: { client_id } })

export const createClientNeed = (data: Partial<ClientNeed>) =>
    apiClient.post<ClientNeed>('/admin/client_needs', { client_need: data })

export const deleteClientNeed = (id: number) =>
    apiClient.delete(`/admin/client_needs/${id}`)
