import apiClient from './client'
import type { Client } from '../types'

export const getClients = (team_id?: number) =>
  apiClient.get<Client[]>('/clients', { params: { team_id } })

export const createClient = (data: Partial<Client>) =>
  apiClient.post<Client>('/clients', { client: data })

export const updateClient = (id: number, data: Partial<Client>) =>
  apiClient.patch<Client>(`/clients/${id}`, { client: data })

export const deleteClient = (id: number) =>
  apiClient.delete(`/clients/${id}`)
