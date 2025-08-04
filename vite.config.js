import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['@xyflow/svelte', '@fal-ai/client']
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});