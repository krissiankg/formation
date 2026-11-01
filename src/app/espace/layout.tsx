import { redirect } from "next/navigation";
import { StudentShell } from "@/components/espace/StudentShell";
import { hasRegistrationAccess } from "@/lib/access/registration";
import { getSessionEnrollment } from "@/lib/auth/session";
import { formation } from "@/lib/config/formation";
import { getStudentPending } from "@/lib/espace/pending";
import { getWhatsAppGroupUrlFor } from "@/lib/settings/whatsapp-group";

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");
  // L'espace s'ouvre une fois la préinscription payée (ou l'accès complet accordé par l'admin).
  if (!hasRegistrationAccess(enrollment)) redirect("/inscription/paiement");

  const firstName = enrollment.fullName.trim().split(/\s+/)[0] || "Apprenant";
  const [pending, whatsappGroupUrl] = await Promise.all([getStudentPending(enrollment), getWhatsAppGroupUrlFor(enrollment)]);

  return (
    <StudentShell
      pending={pending}
      whatsappGroupUrl={whatsappGroupUrl}
      student={{
        firstName,
        fullName: enrollment.fullName,
        email: enrollment.email,
        phone: enrollment.whatsapp,
        scheduleLabel: formation.schedule[enrollment.schedule].label,
        avatarUrl: enrollment.avatarUrl || null,
      }}
    >
      {children}
    </StudentShell>
  );
}
