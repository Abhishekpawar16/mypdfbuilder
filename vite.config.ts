import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // PDF.js ships as a single ~501 KiB minified module and is loaded only by PDF tools.
    chunkSizeWarningLimit: 510,
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist'],
          spreadsheet: ['xlsx'],
          pdfLib: ['pdf-lib'],
          zip: ['jszip'],
          mammoth: ['mammoth'],
          vendor: ['react', 'react-dom', 'lucide-react'],
        },
      },
    },
  },
});
