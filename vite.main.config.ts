import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    'process.env.VITE_API_MODE': JSON.stringify(process.env.VITE_API_MODE),
    'process.env.APEXLINE_API_URL': JSON.stringify(
      process.env.APEXLINE_API_URL ?? process.env.VITE_APEXLINE_API_URL,
    ),
    'process.env.OAUTH_CLIENT_ID': JSON.stringify(
      process.env.OAUTH_CLIENT_ID ?? process.env.VITE_OAUTH_CLIENT_ID,
    ),
    'process.env.SENTRY_DSN': JSON.stringify(process.env.SENTRY_DSN),
  },
});
