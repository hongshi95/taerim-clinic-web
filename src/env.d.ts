/// <reference path="../.astro/types.d.ts" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  SITE_URL: string;
  ADMIN_PIN?: string;
  INDEXNOW_KEY?: string;
}

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_SITE_NAME: string;
  readonly PUBLIC_SITE_DESCRIPTION: string;
  readonly PUBLIC_GSC_VERIFICATION?: string;
  readonly PUBLIC_NAVER_VERIFICATION?: string;
  readonly PUBLIC_BING_VERIFICATION?: string;
  readonly PUBLIC_DAUM_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
