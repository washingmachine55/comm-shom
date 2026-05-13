import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from "node:process"

process.loadEnvFile("../.env")
const BACKEND = process.env.FRONTEND_URL;

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
      }
    }
  }
})
