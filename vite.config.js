import { defineConfig } from 'vite'
import swc from 'unplugin-swc'

export default defineConfig({
  server: {
    port: 5173, // dev server port
    open: true, // auto-open browser on startup
  },
  build: {
    sourcemap: true, // easier debugging in production builds
  },
  resolve: {
    alias: {
      '@': '/src', // so you can import from "@/math/vector"
    },
  },
  plugins: [
    swc.vite(),
  ],
})
