import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/VideoPoster/',
  build: {
    minify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Output to dist/codepen.html for clarity
        entryFileNames: 'script.js',
        assetFileNames: 'style.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
  ]
})
