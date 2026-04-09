import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auto-match': 'http://localhost:3000',
      '/create-room': 'http://localhost:3000',
      '/join-room': 'http://localhost:3000',
      '/start-game': 'http://localhost:3000',
      '/room': 'http://localhost:3000'
    }
  }
});
