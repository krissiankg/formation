import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { StudentTestimonial, TestimonialStatus } from "@/lib/types";

export type TestimonialRow = {
  id: string;
  enrollment_id: string;
  rating: number;
  content: string;
  role_or_project: string | null;
  status: TestimonialStatus;
  created_at: string;
  updated_at: string;
  enrollments?: {
    full_name?: string;
    email?: string;
  } | null;
};

function mapTestimonial(row: TestimonialRow): StudentTestimonial {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    rating: row.rating,
    content: row.content,
    roleOrProject: row.role_or_project,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    studentName: row.enrollments?.full_name,
    studentEmail: row.enrollments?.email,
  };
}

export async function createTestimonial(input: {
  enrollmentId: string;
  rating: number;
  content: string;
  roleOrProject?: string;
}): Promise<StudentTestimonial> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_testimonials")
    .insert({
      enrollment_id: input.enrollmentId,
      rating: Math.min(Math.max(input.rating, 1), 5),
      content: input.content.trim(),
      role_or_project: input.roleOrProject?.trim() || null,
      status: "pending",
    })
    .select("*, enrollments(full_name, email)")
    .single();

  if (error) throw error;
  return mapTestimonial(data as TestimonialRow);
}

export async function getStudentTestimonial(enrollmentId: string): Promise<StudentTestimonial | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_testimonials")
    .select("*, enrollments(full_name, email)")
    .eq("enrollment_id", enrollmentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTestimonial(data as TestimonialRow) : null;
}

export async function listAllTestimonials(): Promise<StudentTestimonial[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_testimonials")
    .select("*, enrollments(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as TestimonialRow[]).map(mapTestimonial);
}

export async function listApprovedTestimonials(): Promise<StudentTestimonial[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_testimonials")
    .select("*, enrollments(full_name, email)")
    .eq("status", "approved")
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as TestimonialRow[]).map(mapTestimonial);
}

export async function updateTestimonialStatus(
  id: string,
  status: TestimonialStatus
): Promise<StudentTestimonial> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("student_testimonials")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*, enrollments(full_name, email)")
    .single();

  if (error) throw error;
  return mapTestimonial(data as TestimonialRow);
}

export async function deleteTestimonial(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("student_testimonials")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
