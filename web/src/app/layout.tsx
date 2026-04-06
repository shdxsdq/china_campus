import type { Metadata } from "next";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "南部县第五小学",
    template: "%s | 南部县第五小学",
  },
  description:
    "基于 Next.js 与 Strapi 自托管的学校官网示例，适合部署到阿里云、腾讯云等国内可备案服务器。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
