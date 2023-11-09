import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({

  build: {
    rollupOptions : { input: 'src/index.jsx',
    output: { dir: '.', entryFileNames: "dist.js" } 
    }
  },
  plugins: [preact()],
});

