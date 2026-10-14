import { AdminShell } from "@/components/admin/AdminShell";
import { getPendingCounts } from "@/lib/admin/pending-counts";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pending = await getPendingCounts();
  return <AdminShell pending={pending}>{children}</AdminShell>;
}
