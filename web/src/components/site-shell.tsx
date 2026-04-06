import type { ReactNode } from "react";

import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import type {
  ContentPost,
  FeaturedSection,
  GalleryAlbum,
  NavigationKey,
  SiteSettings,
  TeacherProfile,
  TeacherSubject,
} from "@/lib/types";

const formatPostDate = (value: string, compact = false) => {
  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return value;
  }

  if (compact) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}.${day}`;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replaceAll("/", "-");
};

export function SiteShell({
  activeNav,
  site,
  children,
}: {
  activeNav: NavigationKey;
  site: SiteSettings;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader activeNav={activeNav} site={site} />
      {children}
      <footer className="footer">
        <div className="container">
          <p>© 2026 {site.schoolName} 版权所有</p>
          <p>
            地址：{site.address} | 电话：{site.phone}
          </p>
        </div>
      </footer>
    </>
  );
}

export function PageHero({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="page-hero">
      <div className="container">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  meta,
  href,
  hrefLabel,
}: {
  title: string;
  meta?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {href && hrefLabel ? (
        <Link className="more-link" href={href}>
          {hrefLabel}
        </Link>
      ) : (
        <span className="more-link">{meta}</span>
      )}
    </div>
  );
}

export function FeaturedSectionCards({
  sections,
}: {
  sections: FeaturedSection[];
}) {
  return (
    <div className="subject-grid">
      {sections.map((section, index) => (
        <Link key={section.id} className="subject-card" href={section.href}>
          <span className="subject-index">{String(index + 1).padStart(2, "0")}</span>
          <h3>{section.title}</h3>
          <p>{section.description}</p>
          <div className="subject-meta">
            <span>{section.metaLabel}</span>
            <strong>{section.ctaLabel}</strong>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function PostListCard({
  title,
  posts,
  basePath,
  compactDate = false,
}: {
  title: string;
  posts: ContentPost[];
  basePath: string;
  compactDate?: boolean;
}) {
  return (
    <article className="list-card">
      <h3>{title}</h3>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link className="post-list-link" href={`${basePath}/${post.slug}`}>
              {post.title}
            </Link>
            <time
              className={`post-list-date${compactDate ? " is-compact" : ""}`}
              dateTime={post.publishedDate}
            >
              {formatPostDate(post.publishedDate, compactDate)}
            </time>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function TeacherSubjectCards({
  subjects,
}: {
  subjects: TeacherSubject[];
}) {
  return (
    <div className="subject-grid">
      {subjects.map((subject, index) => (
        <Link key={subject.id} className="subject-card" href={`/teachers/${subject.slug}`}>
          <span className="subject-index">{String(index + 1).padStart(2, "0")}</span>
          <h3>{subject.name}</h3>
          <p>{subject.description}</p>
          <div className="subject-meta">
            <span>{subject.note}</span>
            <strong>进入栏目</strong>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function TeacherCards({
  teachers,
}: {
  teachers: TeacherProfile[];
}) {
  return (
    <div className="teacher-grid">
      {teachers.map((teacher) => (
        <article key={teacher.id} className="teacher-card">
          <div className="teacher-avatar">{teacher.avatar}</div>
          <div className="teacher-card-body">
            <h4>{teacher.name}</h4>
            <p className="teacher-role">{teacher.role}</p>
            <div className="teacher-tags">
              {teacher.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <p className="teacher-summary">{teacher.shortSummary}</p>
            <Link
              className="teacher-link"
              href={`/teachers/${teacher.subjectSlug}/${teacher.slug}`}
            >
              查看档案
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function GalleryAlbumCards({
  albums,
}: {
  albums: GalleryAlbum[];
}) {
  return (
    <div className="album-cards">
      {albums.map((album) => (
        <a key={album.id} className="album-card" href={`#${album.slug}`}>
          <img src={album.coverImageUrl} alt={`${album.title}封面`} />
          <div className="album-card-meta">
            <h3>{album.title}</h3>
            <p>{album.summary}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <div className="container subject-nav">
      <Link href={href}>{children}</Link>
    </div>
  );
}
