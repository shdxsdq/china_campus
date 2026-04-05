import { notFound } from "next/navigation";

import { BackLink, SectionHeading, SiteShell, TeacherCards } from "@/components/site-shell";
import {
  getSiteContent,
  getTeacherSubjectBySlug,
  getTeacherSubjects,
  getTeachersBySubject,
} from "@/lib/site-data";

export async function generateStaticParams() {
  const subjects = await getTeacherSubjects();
  return subjects.map((subject) => ({ subject: subject.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const item = await getTeacherSubjectBySlug(subject);

  return {
    title: item?.name ?? "师资队伍",
  };
}

export default async function TeacherSubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const { site } = await getSiteContent();
  const subjectInfo = await getTeacherSubjectBySlug(subject);
  const teachers = await getTeachersBySubject(subject);

  if (!subjectInfo) {
    notFound();
  }

  return (
    <SiteShell activeNav="teachers" site={site}>
      <section className="page-hero">
        <div className="container">
          <h2>{subjectInfo.name}</h2>
          <p>{subjectInfo.description}</p>
        </div>
      </section>

      <main className="section">
        <BackLink href="/teachers">返回师资队伍</BackLink>
        <section className="section container teacher-subject-block">
          <SectionHeading
            title={`${subjectInfo.name}教师`}
            meta={subjectInfo.note}
          />
          <TeacherCards teachers={teachers} />
        </section>
      </main>
    </SiteShell>
  );
}
