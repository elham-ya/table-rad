// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      generateScopedName: '[name]__[local]__[hash:base64:5]', // For unique class names
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // Ensure src/index.ts exists
      name: 'TableRad',
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
      formats: ['es', 'umd'], // ESM and UMD formats
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'reactstrap', 'bootstrap'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          reactstrap: 'Reactstrap',
        },
        assetFileNames: 'index.[ext]', // Name CSS file index.css
      },
    },
    outDir: 'dist', // Output to dist
    emptyOutDir: true, // Clear dist before building
  },
});