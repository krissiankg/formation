import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { FormationSession, SessionSchedule } from "@/lib/programme/types";
import type { ScheduleId } from "@/lib/types";

type SessionRow = {
  id: string;
  title: string;
  session_date: string;
  hours: string;
  location: string;
  schedule: SessionSchedule;
  lesson_id: string | null;
  created_at: string;
};

function mapRow(row: SessionRow): FormationSession {
  return {
    id: row.id,
    title: row.title,
    sessionDate: row.session_date,
    hours: row.hours,
    location: row.location,
    schedule: row.schedule,
    lessonId: row.lesson_id,
    createdAt: row.created_at,
  };
}

export async function listSessions(): Promise<FormationSession[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("formation_sessions")
    .select("*")
    .order("session_date", { ascending: true });

  if (error) throw error;
  return (data as SessionRow[]).map(mapRow);
}

export async function getNextSession(schedule: ScheduleId): Promise<FormationSession | null> {
  const today = new Date().toISOString().slice(0, 10);
  const sessions = await listSessions();

  return (
    sessions.find(
      (s) =>
        s.sessionDate >= today &&
        (s.schedule === "both" || s.schedule === schedule),
    ) ?? null
  );
}

export async function createSession(input: {
  title: string;
  sessionDate: string;
  hours: string;
  location: string;
  schedule: SessionSchedule;
  lessonId?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("formation_sessions")
    .insert({
      title: input.title.trim(),
      session_date: input.sessionDate,
      hours: input.hours.trim(),
      location: input.location.trim(),
      schedule: input.schedule,
      lesson_id: input.lessonId ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as SessionRow);
}

export async function updateSession(
  id: string,
  input: Partial<{
    title: string;
    sessionDate: string;
    hours: string;
    location: string;
    schedule: SessionSchedule;
    lessonId: string | null;
  }>,
) {
  const supabase = getSupabaseAdmin();
  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.sessionDate !== undefined) patch.session_date = input.sessionDate;
  if (input.hours !== undefined) patch.hours = input.hours.trim();
  if (input.location !== undefined) patch.location = input.location.trim();
  if (input.schedule !== undefined) patch.schedule = input.schedule;
  if (input.lessonId !== undefined) patch.lesson_id = input.lessonId;

  const { data, error } = await supabase
    .from("formation_sessions")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as SessionRow);
}

export async function deleteSession(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("formation_sessions").delete().eq("id", id);
  if (error) throw error;
}

export function formatSessionDateLabel(dateIso: string, schedule: ScheduleId) {
  const date = new Date(`${dateIso}T12:00:00`);
  const dayName = date.toLocaleDateString("fr-FR", { weekday: "long" });
  const dateLabel = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const scheduleLabel = schedule === "saturday" ? "Samedi" : "Dimanche";
  return `${scheduleLabel === dayName ? scheduleLabel : dayName} ${dateLabel}`;
}
