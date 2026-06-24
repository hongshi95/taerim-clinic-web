// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
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
    // 사이트맵은 src/pages/sitemap.xml.ts(페이지별 실제 lastmod)로 직접 생성. @astrojs/sitemap 제거(중복 방지).
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
