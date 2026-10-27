import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getSessionEnrollment } from "@/lib/auth/session";
import { getCourseAccess } from "@/lib/access/course-access";

export async function getExamplesViewer(): Promise<{ isAdmin: true } | { isAdmin: false; enrollmentId: string } | null> {
  if (await isAdminAuthenticated()) return { isAdmin: true };
  const student = await getSessionEnrollment();
  if (!student || getCourseAccess(student).blocked) return null;
  return { isAdmin: false, enrollmentId: student.id };
}
