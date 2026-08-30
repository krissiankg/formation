import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { FormationTodo, StudentTodo } from "@/lib/programme/types";

type TodoRow = {
  id: string;
  title: string;
  sort_order: number;
  active: boolean;
  created_at: string;
};

type TodoProgressRow = {
  enrollment_id: string;
  todo_id: string;
  completed: boolean;
  completed_at: string | null;
};

function mapTodo(row: TodoRow): FormationTodo {
  return {
    id: row.id,
    title: row.title,
    sortOrder: row.sort_order,
    active: row.active,
    createdAt: row.created_at,
  };
}

export async function listTodos(): Promise<FormationTodo[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("formation_todos")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as TodoRow[]).map(mapTodo);
}

export async function listActiveTodos(): Promise<FormationTodo[]> {
  const todos = await listTodos();
  return todos.filter((t) => t.active);
}

export async function getStudentTodos(enrollmentId: string): Promise<StudentTodo[]> {
  const supabase = getSupabaseAdmin();
  const todos = await listActiveTodos();

  const { data, error } = await supabase
    .from("student_todo_progress")
    .select("*")
    .eq("enrollment_id", enrollmentId);

  if (error) throw error;
  const progress = (data ?? []) as TodoProgressRow[];
  const done = new Set(progress.filter((p) => p.completed).map((p) => p.todo_id));

  return todos.map((todo) => ({
    ...todo,
    completed: done.has(todo.id),
  }));
}

export async function createTodo(input: { title: string; sortOrder?: number }) {
  const supabase = getSupabaseAdmin();
  const todos = await listTodos();
  const sortOrder = input.sortOrder ?? todos.length + 1;

  const { data, error } = await supabase
    .from("formation_todos")
    .insert({
      title: input.title.trim(),
      sort_order: sortOrder,
      active: true,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapTodo(data as TodoRow);
}

export async function updateTodo(
  id: string,
  input: Partial<{ title: string; sortOrder: number; active: boolean }>,
) {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.active !== undefined) patch.active = input.active;

  const { data, error } = await supabase
    .from("formation_todos")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapTodo(data as TodoRow);
}

export async function deleteTodo(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("formation_todos").delete().eq("id", id);
  if (error) throw error;
}

export async function setStudentTodoCompleted(
  enrollmentId: string,
  todoId: string,
  completed: boolean,
) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("student_todo_progress").upsert(
    {
      enrollment_id: enrollmentId,
      todo_id: todoId,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "enrollment_id,todo_id" },
  );

  if (error) throw error;
}
