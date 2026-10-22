import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The backend only accepts browser requests from this exact address (CORS), so fail
    // loudly instead of quietly moving to another port when 5173 is busy.
    port: 5173,
    strictPort: true,
  },
})
