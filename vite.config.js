import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    server: {
        host: '0.0.0.0',
        port: 54995,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                ws: true,
                changeOrigin: true
            }
        },
        watch: {
            // ignore editor/IDE files that may be locked by Visual Studio on Windows
            ignored: ['**/.vs/**', '**/.git/**', '**/node_modules/**']
        }
    }
})
