import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('analytics', () => {
  beforeEach(() => {
    vi.resetModules()
    document.head.innerHTML = ''
    document.title = 'CareShift'
    window.history.replaceState({}, '', '/')
    delete window.gtag
    window.dataLayer = []
  })

  it('injects the GA script and queues config on initialization', async () => {
    const { initializeAnalytics } = await import('./analytics')

    initializeAnalytics()

    const script = document.head.querySelector(
      'script[src="https://www.googletagmanager.com/gtag/js?id=G-G49V4L5G7B"]',
    )

    expect(script).not.toBeNull()
    expect(window.dataLayer).toHaveLength(2)
    expect(Array.from(window.dataLayer[0] as IArguments)).toEqual(['js', expect.any(Date)])
    expect(Array.from(window.dataLayer[1] as IArguments)).toEqual([
      'config',
      'G-G49V4L5G7B',
      { send_page_view: false },
    ])
  })

  it('queues a page_view event with the current location', async () => {
    const { trackPageView } = await import('./analytics')

    window.history.replaceState({}, '', '/settings?tab=profile')
    trackPageView('/settings?tab=profile')

    expect(window.dataLayer).toHaveLength(3)
    expect(Array.from(window.dataLayer[2] as IArguments)).toEqual([
      'event',
      'page_view',
      {
        page_location: 'http://localhost:3000/settings?tab=profile',
        page_path: '/settings?tab=profile',
        page_title: 'CareShift',
      },
    ])
  })
})
