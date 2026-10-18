import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 航路查询 AIRAC 周期号（转发给上游时自动附加 b=AIRAC{周期}）
// 留空则不附加，由上游使用默认期数
const ROUTE_AIRAC_CYCLE = '2610'

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
        rewrite: (path) => path.replace(/^\/api\/route/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (!ROUTE_AIRAC_CYCLE) return
            const url = new URL(req.url, 'http://localhost')
            if (!url.searchParams.has('b')) {
              url.searchParams.set('b', `AIRAC${ROUTE_AIRAC_CYCLE}`)
              proxyReq.path = url.pathname + url.search
            }
          })
        }
      },
      '/api/aviation': {
        target: 'https://aviationweather.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/aviation/, '')
      }
    }
  }
})
