import { notFound } from "next/navigation";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { brand } from "@/lib/config/formation";
import { listLessons, listModules } from "@/lib/store/programme";

export const metadata = {
  title: `Éditer une leçon — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminLessonEditPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const [modules, lessons] = await Promise.all([listModules(), listLessons()]);
  const lesson = lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  return <LessonEditor lesson={lesson} modules={modules} />;
}
