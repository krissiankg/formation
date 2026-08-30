import { redirect } from "next/navigation";
import { PageHeader, ProgrammeList } from "@/components/espace/shared";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";

export const metadata = {
  title: `Mon programme — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function ProgrammePage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Mon programme"
        title="Modules & leçons"
        description="Les contenus se débloquent séance après séance. Commence par le module en cours."
      />
      <ProgrammeList modules={ctx.progress.modules} />
    </div>
  );
}
