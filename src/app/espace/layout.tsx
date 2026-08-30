import { redirect } from "next/navigation";
import { StudentShell } from "@/components/espace/StudentShell";
import { getSessionEnrollment } from "@/lib/auth/session";
import { formation } from "@/lib/config/formation";

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");

  const firstName = enrollment.fullName.trim().split(/\s+/)[0] || "Apprenant";

  return (
    <StudentShell
      student={{
        firstName,
        fullName: enrollment.fullName,
        email: enrollment.email,
        scheduleLabel: formation.schedule[enrollment.schedule].label,
      }}
    >
      {children}
    </StudentShell>
  );
}
