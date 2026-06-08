import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3001,
    proxy: {
      '/api/baidu-translate': {
        target: 'https://fanyi-api.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/baidu-translate/, '/api/trans/vip/translate')
      }
    }
  },
  build: {
    outDir: 'dist'
  }
});
