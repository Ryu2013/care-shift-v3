import apiClient from './client'
import type { User } from '../types'

export const signIn = (email: string, password: string, otp_attempt?: string) =>
  apiClient.post<{ user: User }>('/users/sign_in', { user: { email, password, otp_attempt } })

export const signOut = () =>
  apiClient.delete('/users/sign_out')

export const signUp = (params: { name: string; email: string; password: string; office_id?: number; team_id?: number }) =>
  apiClient.post<{ user: User }>('/users', { user: params })
