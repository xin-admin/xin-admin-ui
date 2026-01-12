import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@': '/src/',
        '~': '/'
      }
    },
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {},
      warmup: {
        clientFiles: ['./index.html', './src/{pages,components}/*']
      }
    }
  }
})
