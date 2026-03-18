const DEFAULT_GA_MEASUREMENT_ID = 'G-G49V4L5G7B'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const GA_MEASUREMENT_ID = DEFAULT_GA_MEASUREMENT_ID

let initialized = false
let scriptInjected = false

function ensureAnalyticsScript() {
  if (scriptInjected || typeof document === 'undefined') {
    return
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)
  scriptInjected = true
}

export function initializeAnalytics() {
  if (initialized || typeof window === 'undefined') {
    return
  }

  ensureAnalyticsScript()
  window.dataLayer = window.dataLayer || []
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments)
    }

  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
  initialized = true
}

export function trackPageView(path: string) {
  if (typeof window === 'undefined') {
    return
  }

  initializeAnalytics()
  window.gtag?.('event', 'page_view', {
    page_location: window.location.href,
    page_path: path,
    page_title: document.title,
  })
}
