import { formation } from "@/lib/config/formation";
import type { Enrollment } from "@/lib/types";
import type { ContentItem } from "@/lib/store/content";

export function getAdminStats(enrollments: Enrollment[], contents: ContentItem[]) {
  const paid = enrollments.filter((e) =>
    e.payments.some((p) => p.kind === "registration" && p.status === "paid"),
  );
  const pending = enrollments.filter(
    (e) =>
      !e.payments.some((p) => p.kind === "registration" && p.status === "paid"),
  );
  const saturday = enrollments.filter((e) => e.schedule === "saturday").length;
  const sunday = enrollments.filter((e) => e.schedule === "sunday").length;
  const published = contents.filter((c) => c.published).length;
  const revenue = paid.length * formation.registrationFee;

  return {
    total: enrollments.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    saturday,
    sunday,
    published,
    draftCount: contents.length - published,
    revenue,
    recent: [...enrollments]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5),
    recentContent: contents.slice(0, 4),
  };
}
