import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  integrations: [tailwind()],
  site: 'https://mbautos.co.uk',
  build: { format: 'directory' }
});
