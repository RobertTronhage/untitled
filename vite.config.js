import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sl': {
        target: 'https://transport.integration.sl.se/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sl/, ''),
      },
    },
  },
})
