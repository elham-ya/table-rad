// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true , rollupTypes: false }), cssInjectedByJsPlugin()],
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',  
    },
    preprocessorOptions: {
      scss: {}
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), 
      name: 'TableRad',
      fileName: (format) => `index.${format === 'es' ? 'esm' : 'umd'}.js`,
      formats: ['es', 'umd'], 
    },
    rollupOptions: {
      // react-toastify باید external باشد، وگرنه یک کپیِ جدا از آن داخلِ dist می‌نشیند
      // و توست‌ها به ToastContainerِ پروژه‌ی اصلی نمی‌رسند
      external: ['react', 'react-dom', 'reactstrap', 'react-toastify'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          reactstrap: 'Reactstrap',
          'react-toastify': 'ReactToastify',
        },
        assetFileNames: 'index.[ext]',
      },
    },
    outDir: 'dist', 
    emptyOutDir: true,
  },
});