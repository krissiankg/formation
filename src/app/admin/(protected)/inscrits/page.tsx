import { EnrollmentsPanel } from "@/components/admin/EnrollmentsPanel";
import { listEnrollments } from "@/lib/store/enrollments";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Inscrits — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminInscritsPage() {
  const enrollments = await listEnrollments();
  return <EnrollmentsPanel enrollments={enrollments} />;
}
