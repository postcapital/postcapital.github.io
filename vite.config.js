import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({

  build: {
    rollupOptions : { input: 'src/postcapital_09c.jsx',
    output: { dir: '.', entryFileNames: "dist.js" } 
    }
  },
  plugins: [preact()],
});

