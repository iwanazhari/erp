import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tanstackRouter from '@tanstack/router-plugin/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tanstackRouter()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
            return 'vendor';
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'router';
          }
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/react-calendar')) {
            return 'ui';
          }
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-') || id.includes('node_modules/victory-')) {
            return 'charts';
          }
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/@react-leaflet')) {
            return 'maps';
          }
          if (id.includes('node_modules/socket.io') || id.includes('node_modules/engine.io')) {
            return 'realtime';
          }
          if (id.includes('node_modules/@geoapify')) {
            return 'geo';
          }
          if (id.includes('node_modules/xlsx')) {
            return 'biglibs';
          }
        },
      },
    },
  },
})
