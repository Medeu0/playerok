import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// __SINGLE_FILE__ is false for normal dev/hosted builds. scripts/single-file-lib.ts
// overrides it to true when producing the standalone dist/<sku>.html export, which
// main.tsx uses to skip service worker registration under file:// (see docs/BUYER_FILE_UX.md).
export default defineConfig({
  plugins: [react()],
  define: { __SINGLE_FILE__: false },
  build: { target: 'es2020' },
  server: { host: '0.0.0.0' },
});
