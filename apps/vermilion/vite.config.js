import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://green.vermilion.place/',
        changeOrigin: true
      },
      '/content': {
        target: 'https://green.vermilion.place/',
        changeOrigin: true
      },
      '/search_api': {
        target: 'https://green.vermilion.place/',
        changeOrigin: true
      },
      '/r': {
        target: 'https://green.vermilion.place/',
        changeOrigin: true
      },
      '/blockheight': {
        target: 'https://green.vermilion.place/',
        changeOrigin: true
      },
      '/blockhash': {
        target: 'https://green.vermilion.place/',
        changeOrigin: true
      },
      '/blocktime': {
        target: 'https://green.vermilion.place/',
        changeOrigin: true
      }
    }
  }
})
