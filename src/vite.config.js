import { defineConfig } from 'vite'
import { resolve } from 'path'
import { createHtmlPlugin } from 'vite-plugin-html'

export default defineConfig({
  build: {
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
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          injectScript: `<script src=\"./codepen.js\"></script>`
        }
      }
    })
  ]
})
