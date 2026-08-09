import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuracion de Vite.
 *
 * En desarrollo el servidor reenvia todo lo que empiece por /api al backend
 * (puerto 4020). Gracias a eso el frontend siempre llama a rutas relativas
 * ("/api/tours") y funciona igual en local que desplegado, donde web y API
 * comparten dominio en Vercel. No hay ninguna direccion del backend escrita
 * a mano en el codigo.
 */
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5180,
    proxy: {
      '/api': {
        target: 'http://localhost:4020',
        changeOrigin: true,
      },
    },
  },

  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:4020',
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
