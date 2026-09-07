import { redirect } from "next/navigation";
import { getStudentContext } from "@/lib/store/student-context";
import { PageHeader } from "@/components/espace/shared";
import { StudentTestimonialClient } from "@/components/espace/StudentTestimonialClient";
import { getStudentTestimonial } from "@/lib/testimonials/store";

export const metadata = {
  title: "Mon Avis & Témoignage — FORGEIA",
};

export const dynamic = "force-dynamic";

export default async function StudentTestimonialPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  const testimonial = await getStudentTestimonial(ctx.enrollment.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        kicker="Témoignage"
        title="Ton avis compte pour nous"
        description="Partage ton retour d'expérience sur la formation FORGEIA et aide les futurs créateurs à franchir le pas."
      />
      <StudentTestimonialClient initialTestimonial={testimonial} />
    </div>
  );
}

