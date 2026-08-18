import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages 部署在仓库子路径（https://<user>.github.io/ask-the-right-questions/）
  // base 必须等于仓库名，否则资源从根路径找 → 白屏
  base: '/ask-the-right-questions/',
})
