import { redirect } from "next/navigation";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";
import { CoinsShopSection } from "@/components/espace/CoinsShopSection";

export const metadata = {
  title: `Boutique Coins & Portefeuille — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function CoinsPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  return (
    <div className="mx-auto max-w-5xl py-2">
      <CoinsShopSection />
    </div>
  );
}
