import { AdminTodosPanel } from "@/components/admin/AdminTodosPanel";
import { listTodos } from "@/lib/store/todos";
import { brand } from "@/lib/config/formation";

export const metadata = {
  title: `À faire — Admin ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function AdminTodosPage() {
  const todos = await listTodos();
  return <AdminTodosPanel todos={todos} />;
}
