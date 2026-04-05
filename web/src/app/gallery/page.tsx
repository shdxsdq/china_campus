import Link from "next/link";

import { GalleryAlbumCards, PageHero, SectionHeading, SiteShell } from "@/components/site-shell";
import { getGalleryAlbums, getSiteContent } from "@/lib/site-data";

export const metadata = {
  title: "活动相册",
};

export default async function GalleryPage() {
  const { site } = await getSiteContent();
  const albums = await getGalleryAlbums();

  return (
    <SiteShell activeNav="gallery" site={site}>
      <PageHero title="活动相册" description={site.pageIntros.gallery} />

      <main className="section">
        <div className="container">
          <SectionHeading title="活动导览" href="/" hrefLabel="返回首页" />
          <GalleryAlbumCards albums={albums} />
        </div>

        <div className="container album-list">
          {albums.map((album) => (
            <section key={album.id} id={album.slug} className="album-block">
              <div className="album-head">
                <h3>{album.title}</h3>
                <Link href={album.externalUrl} target="_blank" rel="noreferrer">
                  查看原始内容
                </Link>
              </div>
              <div className="album-detail">
                <p style={{ marginBottom: 12, color: "#42556d" }}>
                  精选照片 {album.selectedCount} / {album.totalCount}
                </p>
                <div className="gallery-grid">
                  {album.photos.map((photo) => (
                    <figure key={photo.imageUrl} className="gallery-item">
                      <img src={photo.imageUrl} alt={photo.alt} />
                      <figcaption>{photo.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
