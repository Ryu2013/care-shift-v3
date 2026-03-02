import apiClient from './rails-api'
import type { User } from '../types'

export const signIn = (email: string, password: string, otp_attempt?: string) =>
  apiClient.post<{ user: User }>('/users/sign_in', { user: { email, password, otp_attempt } })

export const signOut = () =>
  apiClient.delete('/users/sign_out')

export const signUp = (params: { name: string; email: string; password: string; office_id?: number; team_id?: number }) =>
  apiClient.post<{ user: User }>('/users', { user: params })

export const getTwoFactorSetup = () =>
  apiClient.get<{ secret_key: string; qr_uri: string }>('/users/two_factor/setup')

export const confirmTwoFactor = (otp_attempt: string) =>
  apiClient.post<{ message: string }>('/users/two_factor/confirm', { otp_attempt })
