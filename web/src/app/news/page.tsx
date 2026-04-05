import { PageHero, PostListCard, SiteShell } from "@/components/site-shell";
import { getNewsPosts, getSiteContent } from "@/lib/site-data";

export const metadata = {
  title: "校园新闻",
};

export default async function NewsPage() {
  const { site } = await getSiteContent();
  const posts = await getNewsPosts();

  return (
    <SiteShell activeNav="news" site={site}>
      <PageHero title="校园新闻" description={site.pageIntros.news} />
      <main className="section">
        <div className="container">
          <PostListCard title="新闻列表" posts={posts} basePath="/news" />
        </div>
      </main>
    </SiteShell>
  );
}
