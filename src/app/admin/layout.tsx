import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `Admin — ${brand.name}`,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
