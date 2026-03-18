import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import apiClient from './rails-api'
import * as csrf from './csrf'

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
    csrf.setCsrfToken(null)
    vi.restoreAllMocks()
  })

  it('adds the csrf token to unsafe request headers', async () => {
    csrf.setCsrfToken('test-token')
    const requestInterceptor = getRequestInterceptor()
    const config = await requestInterceptor.fulfilled({
      ...buildConfig(),
      method: 'post',
    })

    expect(config?.headers['X-CSRF-Token']).toBe('test-token')
  })

  it('fetches a csrf token when an unsafe request has none cached', async () => {
    vi.spyOn(csrf, 'ensureCsrfToken').mockResolvedValue('fetched-token')

    const requestInterceptor = getRequestInterceptor()
    const config = await requestInterceptor.fulfilled({
      ...buildConfig(),
      method: 'patch',
    })

    expect(config?.headers['X-CSRF-Token']).toBe('fetched-token')
  })

  it('leaves safe requests untouched', async () => {
    const requestInterceptor = getRequestInterceptor()
    const config = await requestInterceptor.fulfilled({
      ...buildConfig(),
      method: 'get',
    })

    expect(config?.headers['X-CSRF-Token']).toBeUndefined()
  })
})
