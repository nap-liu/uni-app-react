import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { UniAppReact } from '@js-css/uni-app-react/dist/plugins/jsx'
import * as path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [UniAppReact(), uni()],
  optimizeDeps: {
    // 禁用预构建该包，避免缓存
    exclude: ['@js-css/uni-app-react'],
  },
  build: {
    target: 'es2015', // 确保最终产物兼容
    commonjsOptions: {},
    watch:
      // 开发环境特殊配置允许监听指定包
      process.env.NODE_ENV === 'production'
        ? null
        : {
            chokidar: {
              followSymlinks: false,
              ignored: ['!**/node_modules/@js-css/**'],
            },
          },
  },
  resolve: {
    alias: {
      '@': '/src',
      react: path.resolve(__dirname, './node_modules/preact/compat'),
      'react-is': path.resolve(__dirname, './node_modules/preact/compat'),
      'react-dom': path.resolve(__dirname, './node_modules/preact/compat'),
      '@js-css/uni-app-react': path.resolve(
        __dirname,
        './node_modules/@js-css/uni-app-react'
      ),
    },
  },
})
