import type { Enrollment } from "@/lib/types";
import { PageHeader } from "@/components/espace/shared";
import { EnrollmentRow } from "@/components/admin/EnrollmentRow";
import { getAdminStats } from "@/components/admin/admin-stats";
import { formatFcfa } from "@/lib/format";
import { formation } from "@/lib/config/formation";

export function EnrollmentsPanel({ enrollments }: { enrollments: Enrollment[] }) {
  const stats = getAdminStats(enrollments, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        kicker="Inscrits"
        title="Liste de la cohorte"
        description="Tous les apprenants inscrits, leur créneau et le statut du paiement des frais d'inscription."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Total" value={String(stats.total)} />
        <SummaryCard label="Payés" value={String(stats.paidCount)} accent />
        <SummaryCard
          label="Recettes inscription"
          value={formatFcfa(stats.revenue)}
          hint={`${formation.registrationFee.toLocaleString("fr-FR")} FCFA / apprenant`}
        />
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-50)] px-6 py-16 text-center">
          <p className="font-display text-xl">Aucun inscrit pour l&apos;instant</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--neutral-500)]">
            Partage le lien d&apos;inscription : les nouvelles entrées s&apos;afficheront ici
            automatiquement.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[color:var(--neutral-100)] font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--neutral-500)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Apprenant</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Créneau</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Montant</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <EnrollmentRow key={e.id} enrollment={e} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? "border-[color:var(--accent)] bg-[color:var(--accent-lightest)]"
          : "border-[color:var(--border)] bg-[color:var(--neutral-50)]"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--neutral-500)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[color:var(--neutral-500)]">{hint}</p> : null}
    </div>
  );
}
