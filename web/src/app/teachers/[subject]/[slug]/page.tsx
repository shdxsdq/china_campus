import { notFound } from "next/navigation";

import { BackLink, SiteShell } from "@/components/site-shell";
import {
  getSiteContent,
  getTeacherProfileBySlug,
  getTeacherSubjectBySlug,
  getTeacherSubjects,
  getTeachersBySubject,
} from "@/lib/site-data";

export async function generateStaticParams() {
  const subjects = await getTeacherSubjects();
  const params = await Promise.all(
    subjects.map(async (subject) => {
      const teachers = await getTeachersBySubject(subject.slug);
      return teachers.map((teacher) => ({
        subject: subject.slug,
        slug: teacher.slug,
      }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string; slug: string }>;
}) {
  const { subject, slug } = await params;
  const teacher = await getTeacherProfileBySlug(subject, slug);

  return {
    title: teacher ? `${teacher.name}教师档案` : "教师档案",
  };
}

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ subject: string; slug: string }>;
}) {
  const { subject, slug } = await params;
  const { site } = await getSiteContent();
  const subjectInfo = await getTeacherSubjectBySlug(subject);
  const teacher = await getTeacherProfileBySlug(subject, slug);

  if (!subjectInfo || !teacher) {
    notFound();
  }

  return (
    <SiteShell activeNav="teachers" site={site}>
      <section className="page-hero">
        <div className="container">
          <h2>{teacher.name}教师档案</h2>
          <p>以下内容为示例档案结构，后续可直接由 Strapi 后台维护教师资料、荣誉信息与成长记录。</p>
        </div>
      </section>

      <main className="section">
        <BackLink href={`/teachers/${subjectInfo.slug}`}>返回{subjectInfo.name}</BackLink>

        <div className="container profile-layout">
          <div className="profile-main">
            <section className="profile-panel profile-header">
              <div className="teacher-avatar large">{teacher.avatar}</div>
              <div>
                <span className="profile-badge">模拟档案</span>
                <h3>{teacher.name}</h3>
                <p>{teacher.role}</p>
                <div className="teacher-tags">
                  {teacher.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </section>

            <section className="profile-panel">
              <h4>教育理念</h4>
              <p>{teacher.philosophy}</p>
            </section>

            <section className="profile-panel">
              <h4>课堂亮点</h4>
              <ul className="profile-list">
                {teacher.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="profile-panel">
              <h4>成长记录</h4>
              <ul className="profile-list">
                {teacher.growth.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="profile-side">
            <section className="profile-panel">
              <h4>基本信息</h4>
              {teacher.basicFacts.map((fact) => (
                <div key={fact.label} className="profile-quick">
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </section>

            <section className="profile-panel">
              <h4>荣誉与专长</h4>
              <ul className="profile-list">
                {teacher.honors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </SiteShell>
  );
}
