import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import type { Enrollment } from "@/lib/types";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";

export function EnrollmentRow({
  enrollment,
  compact = false,
}: {
  enrollment: Enrollment;
  compact?: boolean;
}) {
  const reg = enrollment.payments.find((p) => p.kind === "registration");
  const paid = reg?.status === "paid";

  if (compact) {
    return (
      <li className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-[color:var(--neutral-black)]">
            {enrollment.fullName}
          </p>
          <p className="truncate text-xs text-[color:var(--neutral-500)]">{enrollment.email}</p>
        </div>
        <PaymentStatusBadge paid={paid} />
      </li>
    );
  }

  return (
    <tr className="border-t border-[color:var(--border)] transition hover:bg-[color:var(--neutral-100)]/80">
      <td className="px-4 py-4">
        <div className="font-medium text-[color:var(--neutral-black)]">{enrollment.fullName}</div>
        <div className="text-xs text-[color:var(--neutral-500)]">{enrollment.email}</div>
      </td>
      <td className="px-4 py-4 text-sm">{enrollment.whatsapp}</td>
      <td className="px-4 py-4 text-sm">
        {formation.schedule[enrollment.schedule].label}
      </td>
      <td className="px-4 py-4">
        <PaymentStatusBadge paid={paid} />
      </td>
      <td className="px-4 py-4 text-sm text-[color:var(--neutral-600)]">
        {paid ? formatFcfa(reg?.amount ?? formation.registrationFee) : "—"}
      </td>
      <td className="px-4 py-4 text-xs text-[color:var(--neutral-500)]">
        {new Date(enrollment.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </td>
    </tr>
  );
}
