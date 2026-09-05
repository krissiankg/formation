import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StudentProject, ProjectStatus } from "@/lib/types";

export type ProjectRow = {
  id: string;
  enrollment_id: string;
  title: string;
  description: string | null;
  project_url: string;
  github_url: string | null;
  demo_credentials: string | null;
  status: ProjectStatus;
  score: number | null;
  feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  enrollments?: {
    full_name?: string;
    whatsapp?: string;
  } | null;
};

function mapProject(row: ProjectRow): StudentProject {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    title: row.title,
    description: row.description,
    projectUrl: row.project_url,
    githubUrl: row.github_url,
    demoCredentials: row.demo_credentials,
    status: row.status,
    score: row.score,
    feedback: row.feedback,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    studentName: row.enrollments?.full_name,
    studentWhatsapp: row.enrollments?.whatsapp,
  };
}

export async function createProject(input: {
  enrollmentId: string;
  title: string;
  description?: string;
  projectUrl: string;
  githubUrl?: string;
  demoCredentials?: string;
}): Promise<StudentProject> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_projects")
    .insert({
      enrollment_id: input.enrollmentId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      project_url: input.projectUrl.trim(),
      github_url: input.githubUrl?.trim() || null,
      demo_credentials: input.demoCredentials?.trim() || null,
      status: "submitted",
    })
    .select("*, enrollments(full_name, whatsapp)")
    .single();

  if (error) throw error;
  return mapProject(data as ProjectRow);
}

export async function getStudentProjects(enrollmentId: string): Promise<StudentProject[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_projects")
    .select("*, enrollments(full_name, whatsapp)")
    .eq("enrollment_id", enrollmentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ProjectRow[]).map(mapProject);
}

export async function listAllProjects(): Promise<StudentProject[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_projects")
    .select("*, enrollments(full_name, whatsapp)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as ProjectRow[]).map(mapProject);
}

export async function reviewProject(
  id: string,
  input: {
    status: ProjectStatus;
    score?: number;
    feedback?: string;
  }
): Promise<StudentProject> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_projects")
    .update({
      status: input.status,
      score: input.score !== undefined ? input.score : null,
      feedback: input.feedback?.trim() || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, enrollments(full_name, whatsapp)")
    .single();

  if (error) throw error;
  return mapProject(data as ProjectRow);
}
