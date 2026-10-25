import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { authApiPlugin } from './src/server/authMiddleware'
import { autopilotPlugin } from './src/server/autopilotMiddleware'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), authApiPlugin(), autopilotPlugin()],
  optimizeDeps: {
    include: ['pdfjs-dist', 'mammoth', 'papaparse']
  }
})
