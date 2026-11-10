import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

/**
 * Plugin cấu hình rewrite đưa toàn bộ yêu cầu điều hướng SPA về index.html
 * (Hỗ trợ cả Vite Dev Server, Preview Server và GitHub Pages 404.html fallback)
 */
function spaRewriteToIndexHtmlPlugin(): Plugin {
  return {
    name: 'spa-rewrite-to-index-html',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();
        const cleanUrl = req.url.split('?')[0];
        const isAssetOrInternal =
          cleanUrl.startsWith('/@') ||
          cleanUrl.startsWith('/node_modules') ||
          cleanUrl.startsWith('/src/') ||
          cleanUrl.includes('/@') ||
          cleanUrl.includes('/src/') ||
          cleanUrl.includes('/node_modules/') ||
          path.extname(cleanUrl) !== '';

        if (!isAssetOrInternal && (req.method === 'GET' || req.method === 'HEAD')) {
          const base = server.config.base || '/';
          req.url = `${base.endsWith('/') ? base : `${base}/`}index.html`;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (!req.url) return next();
        const cleanUrl = req.url.split('?')[0];
        if (path.extname(cleanUrl) === '' && (req.method === 'GET' || req.method === 'HEAD')) {
          const base = server.config.base || '/';
          req.url = `${base.endsWith('/') ? base : `${base}/`}index.html`;
        }
        next();
      });
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const indexFile = path.join(distDir, 'index.html');
      const notFoundFile = path.join(distDir, '404.html');
      if (fs.existsSync(indexFile)) {
        fs.copyFileSync(indexFile, notFoundFile);
      }
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/TO-CHUYEN-MON-TIENG-ANH-THCS-NGUYEN-DU/',
    appType: 'spa' as const,
    plugins: [react(), tailwindcss(), spaRewriteToIndexHtmlPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

