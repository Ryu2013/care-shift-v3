import apiClient from './rails-api'
import type { User } from '../types'

const ensureCsrfCookie = async () => {
  await apiClient.get('/csrf')
}

export const signIn = (email: string, password: string, otp_attempt?: string, remember_me: boolean = false) =>
  ensureCsrfCookie().then(() =>
    apiClient.post<{ user: User }>('/users/sign_in', { user: { email, password, otp_attempt, remember_me } }),
  )

export const signOut = () =>
  ensureCsrfCookie().then(() => apiClient.delete('/users/sign_out'))

export const signUp = (params: { name: string; email: string; password: string; office_id?: number; team_id?: number }) =>
  ensureCsrfCookie().then(() => apiClient.post<{ user: User }>('/users', { user: params }))

export const getTwoFactorSetup = () =>
  apiClient.get<{ secret_key: string; qr_uri: string }>('/two_factor/setup')

export const confirmTwoFactor = (otp_attempt: string) =>
  ensureCsrfCookie().then(() => apiClient.post<{ message: string }>('/two_factor/confirm', { otp_attempt }))

export const requestPasswordReset = (email: string) =>
  ensureCsrfCookie().then(() => apiClient.post<{ message: string }>('/users/password', { user: { email } }))

export const resetPassword = (reset_password_token: string, password: string, password_confirmation: string) =>
  ensureCsrfCookie().then(() => apiClient.put<{ message: string }>('/users/password', { user: { reset_password_token, password, password_confirmation } }))

export const resendConfirmation = (email: string) =>
  ensureCsrfCookie().then(() => apiClient.post<{ message: string }>('/users/confirmation', { user: { email } }))

export const sendUnlockEmail = (email: string) =>
  ensureCsrfCookie().then(() => apiClient.post<{ message: string }>('/users/unlock', { user: { email } }))
