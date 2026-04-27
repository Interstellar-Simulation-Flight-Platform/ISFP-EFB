import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api/isfp': {
        target: 'https://isfpapi.flyisfp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/isfp/, '/api')
      },
      '/api/route': {
        target: 'https://route.hkrscoc.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/route/, '')
      },
      '/api/aviation': {
        target: 'https://aviationweather.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aviation/, '')
      }
    }
  }
})
