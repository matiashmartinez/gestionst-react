import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}, // Asegura que no hay problemas de compatibilidad con las variables
  },
  outDir: "dist", // Directorio de salida
  base: '/',
   'process.env': {},
})
