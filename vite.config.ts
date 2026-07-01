import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'fs';
import { join } from 'path';

function copyDir(src: string, dest: string): void {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  server: { port: 3000 },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  plugins: [{
    name: 'copy-config',
    buildStart() {
      copyDir('config', 'public/config');
    },
    configureServer(server) {
      copyDir('config', 'public/config');
      server.watcher.on('change', (path) => {
        if (path.startsWith('config')) {
          copyDir('config', 'public/config');
        }
      });
    },
  }],
});
