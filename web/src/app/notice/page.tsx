import { PaginationNav } from "@/components/pagination-nav";
import { PageHero, PostListCard, SiteShell } from "@/components/site-shell";
import { paginateItems } from "@/lib/pagination";
import { getNoticePosts, getSiteContent } from "@/lib/site-data";

export const metadata = {
  title: "校园公告",
};

export default async function NoticePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { site } = await getSiteContent();
  const posts = await getNoticePosts();
  const { page } = await searchParams;
  const pagination = paginateItems(posts, page);

  return (
    <SiteShell activeNav="notice" site={site}>
      <PageHero title="校园公告" description={site.pageIntros.notice} />
      <main className="section">
        <div className="container">
          <PostListCard title="公告列表" posts={pagination.items} basePath="/notice" />
          <PaginationNav
            basePath="/notice"
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
          />
        </div>
      </main>
    </SiteShell>
  );
}
