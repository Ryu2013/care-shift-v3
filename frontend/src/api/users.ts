import apiClient from './rails-api'
import type { User } from '../types'

export const getUsers = (team_id?: number) =>
  apiClient.get<User[]>('/admin/users', { params: { team_id } })

export const getOfficeUsers = () =>
  apiClient.get<User[]>('/users')

export const updateUser = (id: number, data: Partial<User> & { password?: string }) =>
  apiClient.patch<User>(`/admin/users/${id}`, { user: data })

export const deleteUser = (id: number) =>
  apiClient.delete(`/admin/users/${id}`)
