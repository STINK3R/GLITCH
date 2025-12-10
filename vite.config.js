import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://185.211.5.223:1488',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://185.211.5.223:1488',
        changeOrigin: true,
        secure: false,
      },
      '/static': {
        target: 'http://185.211.5.223:1488',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://185.211.5.223:1488',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
