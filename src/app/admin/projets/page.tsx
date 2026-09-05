import { AdminShell } from "@/components/admin/AdminShell";
import { AdminProjectsPanel } from "@/components/admin/AdminProjectsPanel";
import { listAllProjects } from "@/lib/projects/store";

export const metadata = {
  title: "Projets SaaS — Admin FORGEIA",
};

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await listAllProjects();

  return (
    <AdminShell>
      <AdminProjectsPanel initialProjects={projects} />
    </AdminShell>
  );
}
