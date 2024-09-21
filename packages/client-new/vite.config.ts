import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
	plugins: [react(), svgr()],
	base: '/',
	root: './src',
	server: {
		host: '192.168.0.2',
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://192.168.0.2:5174/',
				changeOrigin: true,
				ws: true,
				prependPath: true,
			},
			'/static': {
				target: 'http://192.168.0.2:5174/',
				changeOrigin: true,
				ws: true,
				prependPath: true,
			},
		},
	},
	build: {
		outDir: '../build',
		target: 'es2020',
	},
});
