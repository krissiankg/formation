import { AdminTestimonialsPanel } from "@/components/admin/AdminTestimonialsPanel";
import { listAllTestimonials } from "@/lib/testimonials/store";

export const metadata = {
  title: "Modération Avis — Admin FORGEIA",
};

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await listAllTestimonials();

  return <AdminTestimonialsPanel initialTestimonials={testimonials} />;
}
