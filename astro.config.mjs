import { defineConfig } from 'astro/config';
export default defineConfig({
  site: process.env.SITE_URL || 'https://bobuk-io.github.io',
  trailingSlash: 'always',
});
