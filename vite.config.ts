import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // hoặc vue

export default defineConfig({
  plugins: [react()],
  base: './', // Bắt buộc: Chuyển đường dẫn thành tương đối
})