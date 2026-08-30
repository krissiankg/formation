import { SessionsPanel } from "@/components/admin/SessionsPanel";
import { listLessons } from "@/lib/store/programme";
import { listSessions } from "@/lib/store/sessions";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Séances — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const [sessions, lessons] = await Promise.all([listSessions(), listLessons()]);
  return <SessionsPanel sessions={sessions} lessons={lessons} />;
}
