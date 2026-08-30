import { ContentPanel } from "@/components/admin/ContentPanel";
import { listContent } from "@/lib/store/content";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Contenus — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminContenusPage() {
  const contents = await listContent();
  return <ContentPanel contents={contents} />;
}
