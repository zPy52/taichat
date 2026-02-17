import { defineConfig } from 'tsup';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['src/cli.tsx'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  splitting: false,
  sourcemap: true,
  banner: {
    js: `#!/usr/bin/env node
import { createRequire } from 'module';
const require = createRequire(import.meta.url);`,
  },
  noExternal: [/.*/],
  esbuildOptions(options) {
    options.jsx = 'automatic';
    options.alias = {
      'react-devtools-core': './src/shims/empty.js',
      '@': path.join(__dirname, 'src'),
    };
  },
});
