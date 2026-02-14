import { defineConfig } from 'vite';
import { simpliPlugin } from 'simpli-docs/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [simpliPlugin()],
});
