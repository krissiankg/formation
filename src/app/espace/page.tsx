import { redirect } from "next/navigation";
import { StudentDashboard } from "@/components/espace/StudentDashboard";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";
import { getWhatsAppGroupUrl } from "@/lib/settings/whatsapp-group";

export const metadata = {
  title: `Tableau de bord — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function EspacePage() {
  const [ctx, whatsappGroupUrl] = await Promise.all([getStudentContext(), getWhatsAppGroupUrl()]);
  if (!ctx) redirect("/connexion");

  return (
    <StudentDashboard
      enrollment={ctx.enrollment}
      progress={ctx.progress}
      nextSession={ctx.nextSession}
      todos={ctx.todos}
      contents={ctx.contents}
      whatsappGroupUrl={whatsappGroupUrl}
    />
  );
}
