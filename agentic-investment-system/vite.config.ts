import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.XAI_API_KEY': JSON.stringify(env.XAI_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY),
        'process.env.FINNHUB_API_KEY': JSON.stringify(env.FINNHUB_API_KEY)
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      },
      esbuild: {
        loader: 'tsx',
        include: /\.(tsx?|jsx?)$/,
      },
      optimizeDeps: {
        esbuildOptions: {
          loader: {
            '.tsx': 'tsx',
            '.ts': 'ts',
          },
        },
      },
    };
});
