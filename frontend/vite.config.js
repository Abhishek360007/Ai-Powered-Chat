import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, API calls are forwarded to the Spring Boot backend.
// Override with API_PROXY_TARGET if the backend runs elsewhere.
const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': apiTarget },
  },
  preview: {
    port: 4173,
    proxy: { '/api': apiTarget },
  },
});
