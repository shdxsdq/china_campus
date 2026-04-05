import Link from "next/link";

import { SiteShell } from "@/components/site-shell";
import { getSiteContent } from "@/lib/site-data";

export default async function NotFound() {
  const { site } = await getSiteContent();

  return (
    <SiteShell activeNav="home" site={site}>
      <main className="section">
        <div className="container list-card" style={{ textAlign: "center" }}>
          <h3>没有找到对应页面</h3>
          <p style={{ marginTop: 12, color: "#43546c" }}>
            你访问的内容可能已经调整位置，或者当前还没有发布。
          </p>
          <div className="subject-nav" style={{ justifyContent: "center" }}>
            <Link href="/">返回首页</Link>
            <Link href="/news">查看校园新闻</Link>
            <Link href="/teachers">查看师资队伍</Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
