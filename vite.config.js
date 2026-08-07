import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        port: 54995,
        watch: {
            // ignore editor/IDE files that may be locked by Visual Studio on Windows
            ignored: ['**/.vs/**', '**/.git/**', '**/node_modules/**']
        }
    }
})
