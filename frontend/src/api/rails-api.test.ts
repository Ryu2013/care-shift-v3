import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it, beforeEach } from 'vitest'
import apiClient from './rails-api'

describe('apiClient', () => {
  const getRequestInterceptor = () => {
    const requestInterceptor = apiClient.interceptors.request.handlers?.[0]

    if (!requestInterceptor?.fulfilled) {
      throw new Error('Request interceptor is not registered')
    }

    return requestInterceptor
  }

  const buildConfig = (): InternalAxiosRequestConfig => ({
    headers: new AxiosHeaders(),
  } as InternalAxiosRequestConfig)

  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  it('cookie の csrf token をリクエストヘッダーに設定する', async () => {
    document.cookie = 'XSRF-TOKEN=test-token'

    const requestInterceptor = getRequestInterceptor()
    const config = await requestInterceptor.fulfilled(buildConfig())

    expect(config?.headers['X-CSRF-Token']).toBe('test-token')
  })

  it('csrf cookie がないときはヘッダーを変更しない', async () => {
    const requestInterceptor = getRequestInterceptor()
    const config = await requestInterceptor.fulfilled(buildConfig())

    expect(config?.headers['X-CSRF-Token']).toBeUndefined()
  })
})
