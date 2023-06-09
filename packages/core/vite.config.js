const { resolve } = require('path');
import dts from 'vite-plugin-dts';

module.exports = {
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: '@quikc/core',
      fileName: 'index',
      formats: ['cjs', 'es']
    },
    rollupOptions: {
      external: ['fs', 'path']
    }
  },
  plugins: [dts()]
};
