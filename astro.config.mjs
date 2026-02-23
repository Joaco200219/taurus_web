// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'postimg.cc' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }
    ],
  }
});