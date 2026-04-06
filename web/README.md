# Web Frontend

This directory contains the self-hosted Next.js frontend for the campus site.

## Local development

```bash
cp .env.example .env.local
npm run dev
```

When Strapi is running locally, set these values in `.env.local`:

```bash
STRAPI_URL=http://127.0.0.1:1337
STRAPI_PUBLIC_URL=http://127.0.0.1:1337
STRAPI_API_TOKEN=replace-with-a-read-only-token
```

If `STRAPI_URL` is not configured, the frontend falls back to the built-in demo content.

## Domestic production deployment

- `npm run build` produces a standalone build suitable for Alibaba Cloud or Tencent Cloud servers.
- Use `STRAPI_URL` for server-to-server requests. This can be a private IP or `http://127.0.0.1:1337`.
- Use `STRAPI_PUBLIC_URL` for browser-visible media URLs such as `https://cms.example.cn`.
- If you serve CMS assets from a CDN or object storage domain, add it to `SITE_CSP_IMG_SOURCES` and `SITE_CSP_MEDIA_SOURCES`.

See the root [deployment guide](../docs/deploy-cn.md) for Nginx, PM2, and environment examples.
