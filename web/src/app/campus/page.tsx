import Link from "next/link";

import { CampusExplorer } from "@/components/campus/campus-explorer";
import { SiteShell } from "@/components/site-shell";
import { getCampusSpots, getSiteContent } from "@/lib/site-data";

export const metadata = {
  title: "走进校园",
};

export default async function CampusPage() {
  const { site } = await getSiteContent();
  const spots = await getCampusSpots();

  return (
    <SiteShell activeNav="campus" site={site}>
      <section className="campus-hero">
        <div className="container">
          <p className="campus-kicker">实时三维校园导览</p>
          <h2>保持实时渲染，随时从不同角度观察校园布局</h2>
          <p className="campus-hero-copy">{site.pageIntros.campus}</p>
          <div className="campus-hero-stats">
            {site.campusStats.map((stat) => (
              <span key={stat}>{stat}</span>
            ))}
          </div>
        </div>
      </section>

      <main className="section">
        <div className="container">
          <CampusExplorer spots={spots} />
          <div className="subject-nav" style={{ marginTop: 24 }}>
            <Link href="/gallery">查看活动相册</Link>
            <Link href="/teachers">浏览师资队伍</Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
