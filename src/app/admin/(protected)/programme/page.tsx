import { ProgrammePanel } from "@/components/admin/ProgrammePanel";
import { listLessons, listModules } from "@/lib/store/programme";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Programme — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminProgrammePage() {
  const [modules, lessons] = await Promise.all([listModules(), listLessons()]);
  return <ProgrammePanel modules={modules} lessons={lessons} />;
}
