import apiClient from './client'
import type { User } from '../types'

export const getUsers = (team_id?: number) =>
  apiClient.get<User[]>('/users', { params: { team_id } })

export const updateUser = (id: number, data: Partial<User> & { password?: string }) =>
  apiClient.patch<User>(`/users/${id}`, { user: data })

export const deleteUser = (id: number) =>
  apiClient.delete(`/users/${id}`)
