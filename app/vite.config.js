import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://blue.vermilion.place/',
        changeOrigin: true
      },
      '/content': {
        target: 'https://blue.vermilion.place/',
        changeOrigin: true
      },
      '/search_api': {
        target: 'https://blue.vermilion.place/',
        changeOrigin: true
      },
      '/bun': {
        target: 'https://blue.vermilion.place/',
        changeOrigin: true
      },
      '/r': {
        target: 'https://blue.vermilion.place/',
        changeOrigin: true
      },
      '/blockheight': {
        target: 'https://blue.vermilion.place/',
        changeOrigin: true
      },
      '/blockhash': {
        target: 'https://blue.vermilion.place/',
        changeOrigin: true
      },
      '/blocktime': {
        target: 'https://blue.vermilion.place/',
        changeOrigin: true
      },
    },
    historyApiFallback: {
      disableDotRule: true,
    },
  }
})
