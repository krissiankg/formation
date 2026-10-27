import { isAdminAuthenticated } from "@/lib/auth/admin";
import { getSessionEnrollment } from "@/lib/auth/session";
import { getCourseAccess } from "@/lib/access/course-access";

export async function getExamplesViewer(): Promise<{ isAdmin: true } | { isAdmin: false; enrollmentId: string } | null> {
  const student = await getSessionEnrollment();
  if (student) {
    if (getCourseAccess(student).blocked) return null;
    return { isAdmin: false, enrollmentId: student.id };
  }
  return await isAdminAuthenticated() ? { isAdmin: true } : null;
}
