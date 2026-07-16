import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api-atcoder': {
        target: 'https://atcoder.jp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-atcoder/, ''),
      },
      '/api-kenkoooo': {
        target: 'https://kenkoooo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-kenkoooo/, ''),
      },
      '/api-leetcode': {
        target: 'https://alfa-leetcode-api.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-leetcode/, ''),
      }
    }
  }
})
