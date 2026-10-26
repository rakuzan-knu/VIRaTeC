import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { seoPlugin } from './build-tools/seo-plugin';
import { fontPreloadPlugin } from './build-tools/font-preload-plugin';
import { routePreloadPlugin } from './build-tools/route-preload-plugin';
import { responsiveImagesPlugin } from './build-tools/responsive-images-plugin';
import { prerenderPlugin } from './build-tools/prerender-plugin';
import { resolveSiteUrl } from './build-tools/site-url';

const VENDOR_CHUNK = /\/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//;
const QUERY_CHUNK = /\/node_modules\/(@tanstack\/query-core|@tanstack\/react-query|zustand)\//;

export default defineConfig(({ mode, isSsrBuild }) => {
  const siteUrl = resolveSiteUrl(loadEnv(mode, __dirname, 'VITE_').VITE_SITE_URL);
  process.env.VITE_SITE_URL = siteUrl;

  return {
    plugins: [
      react({ babel: { plugins: ['babel-plugin-react-compiler'] } }),
      tailwindcss(),
      ...(isSsrBuild
        ? [prerenderPlugin(path.resolve(__dirname, 'dist'))]
        : [
            fontPreloadPlugin(),
            seoPlugin(siteUrl),
            routePreloadPlugin(),
            responsiveImagesPlugin(
              path.resolve(__dirname, 'node_modules/.cache/responsive-images'),
            ),
          ]),
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
    build: isSsrBuild
      ? { target: 'node22', outDir: 'dist-ssr', copyPublicDir: false }
      : {
          target: 'esnext',
          sourcemap: 'hidden',
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
