import { defineConfig } from 'vite'
import { resolve } from 'path'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'VideoPoster'

export default defineConfig(({ command }) => ({
  // GitHub Pages project sites are served from /<repo-name>/.
  base: command === 'build' ? `/${repositoryName}/` : '/',
  build: {
    minify: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'videoposter.min.js',
        assetFileNames: 'videoposter.min.[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  plugins: [
  ]
}))
