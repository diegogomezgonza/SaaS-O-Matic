import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { createApiProxy } from './config/api-proxy.js';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: createApiProxy('http://127.0.0.1:3000') },
  preview: { proxy: createApiProxy('http://127.0.0.1:3000') },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
