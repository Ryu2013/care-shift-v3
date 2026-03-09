import apiClient from './rails-api'
import type { Team } from '../types'

export const getTeams = () =>
  apiClient.get<Team[]>('/admin/teams')

export const createTeam = (name: string) =>
  apiClient.post<Team>('/admin/teams', { team: { name } })

export const updateTeam = (id: number, name: string) =>
  apiClient.patch<Team>(`/admin/teams/${id}`, { team: { name } })

export const deleteTeam = (id: number) =>
  apiClient.delete(`/admin/teams/${id}`)
