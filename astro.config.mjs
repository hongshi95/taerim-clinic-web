// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import compress from 'astro-compress';

// 정적 출력 + Cloudflare Pages 배포 (어댑터 불필요)
// 동적 API는 Cloudflare Pages Functions로 별도 구현 (추후 functions/ 디렉토리)
export default defineConfig({
  site: 'https://taerimclinic.com',
  output: 'static',
  integrations: [
    react(),
    mdx(),
    sitemap({
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/admin/'),
      i18n: {
        defaultLocale: 'ko',
        locales: { ko: 'ko-KR' },
      },
    }),
    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
          collapseWhitespace: true,
          removeComments: true,
        },
      },
      JavaScript: true,
      SVG: true,
      Image: false,
    }),
  ],
  vite: {
    // @ts-expect-error — vite version duplication between astro + tailwindcss plugin, runtime OK
    plugins: [tailwindcss()],
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  image: {
    domains: ['taerimclinic.com'],
  },
});
