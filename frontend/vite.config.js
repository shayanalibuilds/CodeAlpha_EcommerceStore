import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Bind to 127.0.0.1 so the dev server is reachable for curl verification.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 5173,
  },
});
