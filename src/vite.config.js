import { defineConfig } from 'vite'
import { resolve } from 'path'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'VideoPoster'

export default defineConfig(({ command }) => ({
  // GitHub Pages project sites are served from /<repo-name>/.
  base: command === 'build' ? `/${repositoryName}/` : '/',
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
}))
