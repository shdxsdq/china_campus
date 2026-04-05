import { HeroCarousel } from "@/components/hero-carousel";
import {
  FeaturedSectionCards,
  PostListCard,
  SectionHeading,
  SiteShell,
} from "@/components/site-shell";
import { getSiteContent } from "@/lib/site-data";

export default async function Home() {
  const { site, news, notices } = await getSiteContent();

  return (
    <SiteShell activeNav="home" site={site}>
      <HeroCarousel slides={site.heroSlides} />

      <main>
        <section className="section container">
          <SectionHeading title="重点栏目" meta="首页保留 4 个核心入口" />
          <FeaturedSectionCards sections={site.featuredSections} />
        </section>

        <section className="section section-alt">
          <div className="container intro">
            <img
              className="principal-photo"
              src={site.principalImageUrl}
              alt={`${site.principalTitle}配图`}
            />
            <div>
              <p className="quote-mark">“</p>
              <h2>{site.principalTitle}</h2>
              {site.principalParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="section container">
          <SectionHeading title="最新发布" meta="新闻与公告分开展示" />
          <div className="subject-grid">
            <PostListCard title="校园新闻" posts={news.slice(0, 4)} basePath="/news" />
            <PostListCard
              title="校园公告"
              posts={notices.slice(0, 4)}
              basePath="/notice"
            />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
