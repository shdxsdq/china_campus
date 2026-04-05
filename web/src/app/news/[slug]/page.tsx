import { notFound } from "next/navigation";

import { BackLink, SiteShell } from "@/components/site-shell";
import { formatDisplayDate, getNewsPostBySlug, getNewsPosts, getSiteContent } from "@/lib/site-data";

export async function generateStaticParams() {
  const posts = await getNewsPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);

  return {
    title: post?.title ?? "校园新闻",
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { site } = await getSiteContent();
  const post = await getNewsPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <SiteShell activeNav="news" site={site}>
      <section className="page-hero">
        <div className="container">
          <h2>{post.title}</h2>
          <p>{post.summary}</p>
        </div>
      </section>

      <main className="section">
        <BackLink href="/news">返回校园新闻</BackLink>
        <div className="container profile-layout">
          <div className="profile-main">
            {post.coverImageUrl ? (
              <section className="profile-panel">
                <img
                  className="campus-panel-image"
                  src={post.coverImageUrl}
                  alt={post.title}
                />
              </section>
            ) : null}
            <section className="profile-panel">
              <h4>正文内容</h4>
              <div className="article-copy">
                {post.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          </div>

          <aside className="profile-side">
            <section className="profile-panel">
              <h4>发布时间</h4>
              <div className="profile-quick">
                <span>发布日期</span>
                <strong>{formatDisplayDate(post.publishedDate)}</strong>
              </div>
              <div className="profile-quick">
                <span>栏目类型</span>
                <strong>校园新闻</strong>
              </div>
            </section>

            <section className="profile-panel">
              <h4>内容关键词</h4>
              <ul className="profile-list">
                {post.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </SiteShell>
  );
}
