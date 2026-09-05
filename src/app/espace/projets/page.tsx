import { redirect } from "next/navigation";
import { getSessionEnrollment } from "@/lib/auth/session";
import { StudentShell } from "@/components/espace/StudentShell";
import { StudentProjectsClient } from "@/components/espace/StudentProjectsClient";
import { getStudentProjects } from "@/lib/projects/store";

export const metadata = {
  title: "Mes Projets SaaS — FORGEIA",
};

export const dynamic = "force-dynamic";

export default async function StudentProjectsPage() {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) {
    redirect("/connexion");
  }

  const projects = await getStudentProjects(enrollment.id);

  const [firstName] = enrollment.fullName.trim().split(/\s+/);

  return (
    <StudentShell
      student={{
        firstName: firstName || "Apprenant",
        fullName: enrollment.fullName,
        email: enrollment.email,
        phone: enrollment.whatsapp,
        scheduleLabel: enrollment.schedule === "saturday" ? "Samedi" : "Dimanche",
        isPaid: enrollment.payments.some((p) => p.kind === "registration" && p.status === "paid"),
      }}
    >
      <StudentProjectsClient initialProjects={projects} />
    </StudentShell>
  );
}
