import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { seoPlugin } from './build-tools/seo-plugin';
import { fontPreloadPlugin } from './build-tools/font-preload-plugin';
import { resolveSiteUrl } from './build-tools/site-url';

const VENDOR_CHUNK = /\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//;
const QUERY_CHUNK = /\/node_modules\/(@tanstack\/query-core|@tanstack\/react-query|zustand)\//;

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const siteUrl = resolveSiteUrl(loadEnv(mode, __dirname, 'VITE_').VITE_SITE_URL);
  process.env.VITE_SITE_URL = siteUrl;

  return {
    plugins: [
      react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
      tailwindcss(),
      fontPreloadPlugin(),
      seoPlugin(siteUrl),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'esnext',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (VENDOR_CHUNK.test(id)) return 'vendor';
            if (QUERY_CHUNK.test(id)) return 'query';
          },
        },
      },
    },
  };
});
