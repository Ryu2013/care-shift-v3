import { describe, expect, it, beforeEach, vi } from 'vitest'
import apiClient from './rails-api'

describe('apiClient', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    })
  })

  it('adds the csrf token from cookies to request headers', async () => {
    document.cookie = 'XSRF-TOKEN=test-token'

    const [requestInterceptor] = apiClient.interceptors.request.handlers
    const config = await requestInterceptor.fulfilled?.({ headers: {} })

    expect(config?.headers['X-CSRF-Token']).toBe('test-token')
  })

  it('leaves headers untouched when the csrf cookie is missing', async () => {
    const [requestInterceptor] = apiClient.interceptors.request.handlers
    const config = await requestInterceptor.fulfilled?.({ headers: {} })

    expect(config?.headers['X-CSRF-Token']).toBeUndefined()
  })
})
