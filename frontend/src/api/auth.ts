import apiClient from './rails-api'
import { ensureCsrfToken, setCsrfToken } from './csrf'
import type { User } from '../types'

export const signIn = (email: string, password: string, otp_attempt?: string, remember_me: boolean = false) =>
  ensureCsrfToken().then(() =>
    apiClient.post<{ user: User }>('/users/sign_in', { user: { email, password, otp_attempt, remember_me } }).then((response) => {
      // Devise rotates the session on sign in, so the pre-login CSRF token is no longer valid.
      setCsrfToken(null)
      return response
    }),
  )

export const signOut = () =>
  ensureCsrfToken().then(() =>
    apiClient.delete('/users/sign_out').then((response) => {
      setCsrfToken(null)
      return response
    }),
  )

export const signUp = (params: { name: string; email: string; password: string; office_id?: number; team_id?: number }) =>
  ensureCsrfToken().then(() =>
    apiClient.post<{ user: User }>('/users', { user: params }).then((response) => {
      setCsrfToken(null)
      return response
    }),
  )

export const getTwoFactorSetup = () =>
  apiClient.get<{ secret_key: string; qr_uri: string }>('/two_factor/setup')

export const confirmTwoFactor = (otp_attempt: string) =>
  ensureCsrfToken().then(() => apiClient.post<{ message: string }>('/two_factor/confirm', { otp_attempt }))

export const requestPasswordReset = (email: string) =>
  ensureCsrfToken().then(() => apiClient.post<{ message: string }>('/users/password', { user: { email } }))

export const resetPassword = (reset_password_token: string, password: string, password_confirmation: string) =>
  ensureCsrfToken().then(() => apiClient.put<{ message: string }>('/users/password', { user: { reset_password_token, password, password_confirmation } }))

export const resendConfirmation = (email: string) =>
  ensureCsrfToken().then(() => apiClient.post<{ message: string }>('/users/confirmation', { user: { email } }))

export const sendUnlockEmail = (email: string) =>
  ensureCsrfToken().then(() => apiClient.post<{ message: string }>('/users/unlock', { user: { email } }))
