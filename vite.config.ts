import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { authApiPlugin } from './src/server/authMiddleware'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), authApiPlugin()],
  optimizeDeps: {
    include: ['pdfjs-dist', 'mammoth', 'papaparse']
  }
})
