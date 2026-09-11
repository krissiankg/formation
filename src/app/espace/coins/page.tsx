import { redirect } from "next/navigation";
import { brand } from "@/lib/config/formation";
import { getSessionEnrollment } from "@/lib/auth/session";
import { CoinsShopSection } from "@/components/espace/CoinsShopSection";

export const metadata = {
  title: `Boutique Coins & Portefeuille — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function CoinsPage() {
  const enrollment = await getSessionEnrollment();
  if (!enrollment) redirect("/connexion");

  return (
    <div className="mx-auto max-w-5xl py-2">
      <CoinsShopSection />
    </div>
  );
}
