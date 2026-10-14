import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentProjects } from "@/lib/projects/store";
import { StudentProjectsClient } from "@/components/espace/StudentProjectsClient";
import { canSubmitProjects } from "@/lib/access/server";
import { getStudentContext } from "@/lib/store/student-context";

export const metadata = {
  title: "Mes projets — FORGEIA",
};

export const dynamic = "force-dynamic";

export default async function StudentProjectsPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  if (!canSubmitProjects(ctx.enrollment)) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] px-6 py-12 text-center">
        <p className="font-display text-xl">🔒 Mes projets</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--neutral-600)]">
          {ctx.access.blocked
            ? "Accès suspendu — contacte le formateur."
            : "Le dépôt de tes projets s'ouvre avec le Mois 1, après le paiement de la 1re tranche."}
        </p>
        {ctx.access.blocked ? null : (
          <Link href="/espace/paiements" className="btn-primary mt-6 inline-flex !py-2.5 text-sm">
            Voir mes paiements →
          </Link>
        )}
      </div>
    );
  }

  const projects = await getStudentProjects(ctx.enrollment.id);

  return <StudentProjectsClient initialProjects={projects} />;
}
