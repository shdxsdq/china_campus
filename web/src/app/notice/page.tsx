import { PageHero, PostListCard, SiteShell } from "@/components/site-shell";
import { getNoticePosts, getSiteContent } from "@/lib/site-data";

export const metadata = {
  title: "校园公告",
};

export default async function NoticePage() {
  const { site } = await getSiteContent();
  const posts = await getNoticePosts();

  return (
    <SiteShell activeNav="notice" site={site}>
      <PageHero title="校园公告" description={site.pageIntros.notice} />
      <main className="section">
        <div className="container">
          <PostListCard title="公告列表" posts={posts} basePath="/notice" />
        </div>
      </main>
    </SiteShell>
  );
}
