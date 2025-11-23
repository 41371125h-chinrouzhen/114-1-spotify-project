import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {

          if (id.includes('node_modules')) {
            return 'vendor'; 
          }
          
          // if (id.includes('node_modules')) {
          //     if (id.includes('three')) {
          //         return 'three_lib';
          //     }
          //     if (id.includes('firebase')) {
          //         return 'firebase_lib';
          //     }
          //     return 'vendor'; 
          // }
        }
      }
    }
  }
})