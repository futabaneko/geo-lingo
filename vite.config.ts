import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages にデプロイする場合、リポジトリ名がサブパスになる
// 例: https://<user>.github.io/<repo> → base: '/<repo>/' を設定
// 必要に応じて環境変数や実デプロイ名に合わせて変更してください
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/geo-lingo/'
})
