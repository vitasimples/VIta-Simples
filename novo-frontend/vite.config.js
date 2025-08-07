import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true   // <--- ativa o SW no modo dev
      },
      manifest: {
        name: 'Vita Simples',
        short_name: 'Vita',
        description: 'App de perguntas e respostas acessível a qualquer hora, offline incluído',
        theme_color: '#007acc',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3
            }
          }
        ]
      }
    })
  ]
});
