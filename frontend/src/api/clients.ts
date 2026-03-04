import apiClient from './rails-api'
import type { Client } from '../types'

export const getClients = (team_id?: number) =>
  apiClient.get<Client[]>('/admin/clients', { params: { team_id } })

export const createClient = (data: Partial<Client>) =>
  apiClient.post<Client>('/admin/clients', { client: data })

export const updateClient = (id: number, data: Partial<Client>) =>
  apiClient.patch<Client>(`/admin/clients/${id}`, { client: data })

export const deleteClient = (id: number) =>
  apiClient.delete(`/admin/clients/${id}`)
