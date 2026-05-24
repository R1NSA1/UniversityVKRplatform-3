import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: '/login',
    proxy: {
      // Напрямую в сервисы (порты из docker-compose) — надёжнее для локальной разработки
      '/auth': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, ''),
      },
      '/topic': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/topic/, ''),
      },
      '/api/admin': {
        target: 'http://localhost:8004',
        changeOrigin: true,
      },
      '/api/email': {
        target: 'http://localhost:8003',
        changeOrigin: true,
      },
    },
  },
})
