import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Bind to 127.0.0.1 so the dev server is reachable for curl verification.
// /api is proxied to the backend so no CORS setup is needed in dev/preview.
// The default must match the API port the README tells you to run (5001).
const API_TARGET = process.env.VITE_API_PROXY || 'http://127.0.0.1:5001';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': API_TARGET },
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': API_TARGET },
  },
});
