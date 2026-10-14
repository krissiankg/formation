import { EnrollmentsPanel } from "@/components/admin/EnrollmentsPanel";
import { listEnrollments } from "@/lib/store/enrollments";
import { listWalletBalances } from "@/lib/wallet/store";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Inscrits — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminInscritsPage() {
  const [enrollments, coinBalances] = await Promise.all([listEnrollments(), listWalletBalances()]);
  return <EnrollmentsPanel enrollments={enrollments} coinBalances={coinBalances} />;
}
