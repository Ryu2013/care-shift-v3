import apiClient from './client'
import type { Team } from '../types'

export const getTeams = () =>
  apiClient.get<Team[]>('/teams')

export const createTeam = (name: string) =>
  apiClient.post<Team>('/teams', { team: { name } })

export const updateTeam = (id: number, name: string) =>
  apiClient.patch<Team>(`/teams/${id}`, { team: { name } })

export const deleteTeam = (id: number) =>
  apiClient.delete(`/teams/${id}`)
