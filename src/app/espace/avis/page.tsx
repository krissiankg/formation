import { redirect } from "next/navigation";
import { getSessionEnrollment } from "@/lib/auth/session";
import { StudentShell } from "@/components/espace/StudentShell";
import { PageHeader } from "@/components/espace/shared";
import { StudentTestimonialClient } from "@/components/espace/StudentTestimonialClient";
import { getStudentTestimonial } from "@/lib/testimonials/store";

export const metadata = {
  title: "Mon Avis & Témoignage — FORGEIA",
};

export const dynamic = "force-dynamic";

export default async function StudentTestimonialPage() {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");

  const testimonial = await getStudentTestimonial(enrollment.id);
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
      <div className="mx-auto max-w-3xl">
        <PageHeader
          kicker="Témoignage"
          title="Ton avis compte pour nous"
          description="Partage ton retour d'expérience sur la formation FORGEIA et aide les futurs créateurs à franchir le pas."
        />
        <StudentTestimonialClient initialTestimonial={testimonial} />
      </div>
    </StudentShell>
  );
}
