import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'icon-152.png'],
      workbox: {
        // API requests, including OAuth callback navigations, must bypass the SPA fallback.
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
      },
      manifest: {
        name: 'ケアシフト',
        short_name: 'CareShift',
        description: '重度訪問介護事業向け業務効率化サービス',
        theme_color: '#FFF8F0',
        background_color: '#ffffffff',
        display: 'standalone',
        start_url: '/user-shifts',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://api:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
    css: true,
    exclude: ['e2e/**', '**/node_modules/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**'],
  },
})
