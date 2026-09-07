import { redirect } from "next/navigation";
import { getStudentProjects } from "@/lib/projects/store";
import { StudentProjectsClient } from "@/components/espace/StudentProjectsClient";
import { getStudentContext } from "@/lib/store/student-context";

export const metadata = {
  title: "Mes Projets SaaS — FORGEIA",
};

export const dynamic = "force-dynamic";

export default async function StudentProjectsPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  const projects = await getStudentProjects(ctx.enrollment.id);

  return <StudentProjectsClient initialProjects={projects} />;
}
