import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const config = {
    plugins: [react()],
  }

  if (command !== 'serve') {
    // configurazione per la build di produzione
    return config
  }

  // configurazione per lo sviluppo
  return {
    ...config,
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})