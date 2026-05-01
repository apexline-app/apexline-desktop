import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      'process.env.VITE_API_MODE': JSON.stringify(env.VITE_API_MODE),
      'process.env.APEXLINE_API_URL': JSON.stringify(
        env.APEXLINE_API_URL ?? env.VITE_APEXLINE_API_URL,
      ),
      'process.env.OAUTH_CLIENT_ID': JSON.stringify(
        env.OAUTH_CLIENT_ID ?? env.VITE_OAUTH_CLIENT_ID,
      ),
      'process.env.SENTRY_DSN': JSON.stringify(env.SENTRY_DSN),
    },
  };
});
