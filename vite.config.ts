import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'public',
  server: {
    port: 3000,
    host: 'localhost',
    open: false,
    middlewareMode: false,
    fs: {
      allow: ['..']
    }
  },
  build: {
    outDir: '../dist',
    sourcemap: false,
    emptyOutDir: true,
  },
})
