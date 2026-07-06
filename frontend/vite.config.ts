import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Allow all *.localhost subdomains (e.g. demo.localhost:5173)
    allowedHosts: ['localhost', '.localhost'],
    proxy: {
      // Proxy all backend API routes through Vite to avoid CORS issues on subdomains
      '/auth': { target: 'http://localhost:3001', changeOrigin: true },
      '/accounts': { target: 'http://localhost:3001', changeOrigin: true },
      '/suppliers': { target: 'http://localhost:3001', changeOrigin: true },
      '/invoices': { target: 'http://localhost:3001', changeOrigin: true },
      '/payments': { target: 'http://localhost:3001', changeOrigin: true },
      '/collections': { target: 'http://localhost:3001', changeOrigin: true },
      '/cheques': { target: 'http://localhost:3001', changeOrigin: true },
      '/expenses': { target: 'http://localhost:3001', changeOrigin: true },
      '/users': { target: 'http://localhost:3001', changeOrigin: true },
      '/onboarding': { target: 'http://localhost:3001', changeOrigin: true },
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})

