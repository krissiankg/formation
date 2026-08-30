import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { FormationLesson, FormationModule } from "@/lib/programme/types";

type ModuleRow = {
  id: string;
  sort_order: number;
  month_label: string;
  title: string;
  created_at: string;
};

type LessonRow = {
  id: string;
  module_id: string;
  sort_order: number;
  title: string;
  type: FormationLesson["type"];
  duration: string;
  body: string;
  created_at: string;
};

function mapModule(row: ModuleRow): FormationModule {
  return {
    id: row.id,
    sortOrder: row.sort_order,
    monthLabel: row.month_label,
    title: row.title,
    createdAt: row.created_at,
  };
}

function mapLesson(row: LessonRow): FormationLesson {
  return {
    id: row.id,
    moduleId: row.module_id,
    sortOrder: row.sort_order,
    title: row.title,
    type: row.type,
    duration: row.duration,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function listModules(): Promise<FormationModule[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("formation_modules")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as ModuleRow[]).map(mapModule);
}

export async function listLessons(): Promise<FormationLesson[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("formation_lessons")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as LessonRow[]).map(mapLesson);
}

export async function createModule(input: {
  monthLabel: string;
  title: string;
  sortOrder?: number;
}) {
  const supabase = getSupabaseAdmin();
  const modules = await listModules();
  const sortOrder = input.sortOrder ?? modules.length + 1;

  const { data, error } = await supabase
    .from("formation_modules")
    .insert({
      month_label: input.monthLabel.trim(),
      title: input.title.trim(),
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapModule(data as ModuleRow);
}

export async function updateModule(
  id: string,
  input: Partial<{ monthLabel: string; title: string; sortOrder: number }>,
) {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = {};
  if (input.monthLabel !== undefined) patch.month_label = input.monthLabel.trim();
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const { data, error } = await supabase
    .from("formation_modules")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapModule(data as ModuleRow);
}

export async function deleteModule(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("formation_modules").delete().eq("id", id);
  if (error) throw error;
}

export async function createLesson(input: {
  moduleId: string;
  title: string;
  type: FormationLesson["type"];
  duration: string;
  body?: string;
  sortOrder?: number;
}) {
  const supabase = getSupabaseAdmin();
  const lessons = (await listLessons()).filter((l) => l.moduleId === input.moduleId);
  const sortOrder = input.sortOrder ?? lessons.length + 1;

  const { data, error } = await supabase
    .from("formation_lessons")
    .insert({
      module_id: input.moduleId,
      title: input.title.trim(),
      type: input.type,
      duration: input.duration.trim(),
      body: (input.body ?? "").trim(),
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapLesson(data as LessonRow);
}

export async function updateLesson(
  id: string,
  input: Partial<{
    title: string;
    type: FormationLesson["type"];
    duration: string;
    body: string;
    sortOrder: number;
    moduleId: string;
  }>,
) {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.type !== undefined) patch.type = input.type;
  if (input.duration !== undefined) patch.duration = input.duration.trim();
  if (input.body !== undefined) patch.body = input.body.trim();
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;
  if (input.moduleId !== undefined) patch.module_id = input.moduleId;

  const { data, error } = await supabase
    .from("formation_lessons")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapLesson(data as LessonRow);
}

export async function deleteLesson(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("formation_lessons").delete().eq("id", id);
  if (error) throw error;
}
