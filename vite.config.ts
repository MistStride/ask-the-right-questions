import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 部署到 GitHub Pages 时需要换成仓库名，例如 base: '/ask-the-right-questions/'
  base: '/',
})
