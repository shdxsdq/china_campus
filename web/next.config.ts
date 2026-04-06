import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const isDevelopment = process.env.NODE_ENV === "development";

const toOrigin = (value?: string) => {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};

const normalizeSource = (value: string) => {
  if (value.includes("*") || value.startsWith("'") || value.endsWith(":")) {
    return value;
  }

  return toOrigin(value) ?? value;
};

const parseSourceList = (value?: string) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => normalizeSource(item)) ?? [];

const unique = (items: Array<string | undefined>) =>
  Array.from(new Set(items.filter((item): item is string => Boolean(item))));

const cmsOrigin = toOrigin(
  process.env.STRAPI_PUBLIC_URL?.trim() || process.env.STRAPI_URL?.trim(),
);
const imageSources = unique([
  cmsOrigin,
  ...parseSourceList(process.env.SITE_CSP_IMG_SOURCES),
]);
const mediaSources = unique([
  cmsOrigin,
  ...parseSourceList(process.env.SITE_CSP_MEDIA_SOURCES),
  ...imageSources,
]);
const connectSources = unique([
  cmsOrigin,
  ...parseSourceList(process.env.SITE_CSP_CONNECT_SOURCES),
  ...(isDevelopment ? ["ws:", "http://localhost:*", "http://127.0.0.1:*"] : []),
]);

const buildDirective = (name: string, values: string[]) =>
  `${name} ${values.join(" ")}`;

const buildContentSecurityPolicy = () => {
  const directives = [
    buildDirective("default-src", ["'self'"]),
    buildDirective("script-src", [
      "'self'",
      "'unsafe-inline'",
      ...(isDevelopment ? ["'unsafe-eval'"] : []),
    ]),
    buildDirective("style-src", ["'self'", "'unsafe-inline'"]),
    buildDirective("img-src", ["'self'", "data:", "blob:", ...imageSources]),
    buildDirective("media-src", ["'self'", "data:", "blob:", ...mediaSources]),
    buildDirective("font-src", ["'self'", "data:"]),
    buildDirective("connect-src", ["'self'", ...connectSources]),
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ];

  return directives.join("; ");
};

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  ...(
    isDevelopment
      ? []
      : [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ]
  ),
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  turbopack: {
    root: rootDirectory,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
