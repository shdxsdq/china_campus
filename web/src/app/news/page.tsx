import { PaginationNav } from "@/components/pagination-nav";
import { PageHero, PostListCard, SiteShell } from "@/components/site-shell";
import { paginateItems } from "@/lib/pagination";
import { getNewsPosts, getSiteContent } from "@/lib/site-data";

export const metadata = {
  title: "校园新闻",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { site } = await getSiteContent();
  const posts = await getNewsPosts();
  const { page } = await searchParams;
  const pagination = paginateItems(posts, page);

  return (
    <SiteShell activeNav="news" site={site}>
      <PageHero title="校园新闻" description={site.pageIntros.news} />
      <main className="section">
        <div className="container">
          <PostListCard title="新闻列表" posts={pagination.items} basePath="/news" />
          <PaginationNav
            basePath="/news"
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
          />
        </div>
      </main>
    </SiteShell>
  );
}
