import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { WhatsAppGroupCard } from "@/components/admin/WhatsAppGroupCard";
import { listEnrollments } from "@/lib/store/enrollments";
import { listContent } from "@/lib/store/content";
import { getWhatsAppGroupUrl } from "@/lib/settings/whatsapp-group";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [enrollments, contents, whatsappGroupUrl] = await Promise.all([
    listEnrollments(),
    listContent(),
    getWhatsAppGroupUrl(),
  ]);

  return (
    <>
      <WhatsAppGroupCard initialUrl={whatsappGroupUrl} />
      <AdminDashboard enrollments={enrollments} contents={contents} />
    </>
  );
}
