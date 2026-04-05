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
    "基于 Next.js、Strapi 与 Vercel 搭建的学校官网示例，包含校园新闻、公告、师资队伍、活动相册与校园导览。",
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
