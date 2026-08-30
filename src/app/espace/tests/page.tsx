import { redirect } from "next/navigation";
import { PageHeader, TestsPanel } from "@/components/espace/shared";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";

export const metadata = {
  title: `Tests — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  const tests = ctx.progress.modules.flatMap((m) =>
    m.lessons.filter((l) => l.type === "test"),
  );

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker="Tests"
        title="Quiz & validation"
        description="Valide ce que tu as appris après certaines séances. Les tests se débloquent progressivement."
      />
      <TestsPanel tests={tests} />
    </div>
  );
}
