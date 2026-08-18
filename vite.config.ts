import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages 部署在仓库子路径（https://<user>.github.io/ask-the-right-questions/）
  // 仅在 build 时使用仓库路径 base；dev 环境保持根路径（本地开发/验证脚本不受影响）
  base: command === 'build' ? '/ask-the-right-questions/' : '/',
  build: {
    // 构建产物输出到 docs/（提交进仓库），配合 GitHub Pages：
    // Settings → Pages → Deploy from a branch → folder 选 /docs 即可生效（不用改分支）
    outDir: 'docs',
  },
}))
