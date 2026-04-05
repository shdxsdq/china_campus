import { PageHero, SectionHeading, SiteShell, TeacherSubjectCards } from "@/components/site-shell";
import { getSiteContent, getTeacherSubjects } from "@/lib/site-data";

export const metadata = {
  title: "师资队伍",
};

export default async function TeachersPage() {
  const { site } = await getSiteContent();
  const subjects = await getTeacherSubjects();

  return (
    <SiteShell activeNav="teachers" site={site}>
      <PageHero title="师资队伍" description={site.pageIntros.teachers} />

      <main className="section">
        <div className="container list-card archive-note">
          <h3>栏目说明</h3>
          <p>{site.teacherArchiveNote}</p>
        </div>

        <section className="section container">
          <SectionHeading title="学科分组" meta="先选学科，再看老师" />
          <TeacherSubjectCards subjects={subjects} />
        </section>
      </main>
    </SiteShell>
  );
}
