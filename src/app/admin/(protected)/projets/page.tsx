import { AdminProjectsPanel } from "@/components/admin/AdminProjectsPanel";
import { listAllProjects } from "@/lib/projects/store";

export const metadata = {
  title: "Projets à évaluer — Admin FORGEIA",
};

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await listAllProjects();

  return <AdminProjectsPanel initialProjects={projects} />;
}
