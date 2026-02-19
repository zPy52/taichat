import path from 'path';
import { defineConfig } from 'tsup';
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
      '@': path.join(__dirname, 'src'),
      // Stub so the bundle does not require react-devtools-core at runtime (Ink only uses it when DEV=true).
      'react-devtools-core': path.join(__dirname, 'scripts/react-devtools-core-stub.js'),
    };
  },
});
