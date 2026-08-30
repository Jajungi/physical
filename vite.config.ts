import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages: 저장소 이름에 맞게 base 경로 (Jajungi/physical → /physical/)
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/physical/' : '/',
  plugins: [react(), tailwindcss()],
})
