// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true , rollupTypes: true })],
  css: {
    modules: {
      generateScopedName: '[name]__[local]__[hash:base64:5]', 
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), 
      name: 'TableRad',
      fileName: 'index',
      formats: ['es', 'umd'], 
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          reactstrap: 'Reactstrap',
        },
        assetFileNames: 'index.[ext]',
      },
    },
    outDir: 'dist', 
    emptyOutDir: true,
  },
});