import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/apps': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/insertions': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/signin': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/signup': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
