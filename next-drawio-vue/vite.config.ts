import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// Process 对象 polyfill
const processEnv = {
  NODE_ENV: 'development',
  BUILD_NUMBER: 'dev',
  GIT_COMMIT: 'unknown',
  NEXT_PUBLIC_API_URL: '/api',
  NEXT_PUBLIC_WS_URL: '',
  NEXT_PUBLIC_CDN_URL: '',
  LOG_LEVEL: 'info',
  PORT: '3000',
  HOST: 'localhost',
  SENTRY_DSN: '',
  FEATURE_WEBGL: 'false',
  FEATURE_AI: 'false',
  FEATURE_COLLAB: 'false',
  FEATURE_SYNC: 'false',
};

const processPolyfill = {
  platform: 'darwin',
  env: processEnv,
};

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss()
  ],
  optimizeDeps: {
    include: ['@drawio/core'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@drawio/core': path.resolve(__dirname, '../next-drawio-react/packages/drawio-core/src'),
    },
  },
  define: {
    'process': JSON.stringify(processPolyfill),
  },
});
