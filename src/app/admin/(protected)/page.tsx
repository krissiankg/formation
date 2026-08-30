import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { listEnrollments } from "@/lib/store/enrollments";
import { listContent } from "@/lib/store/content";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [enrollments, contents] = await Promise.all([
    listEnrollments(),
    listContent(),
  ]);

  return <AdminDashboard enrollments={enrollments} contents={contents} />;
}
