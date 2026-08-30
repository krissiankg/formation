import Link from "next/link";
import { formation } from "@/lib/config/formation";
import { getNextPayment } from "@/lib/programme/payments";
import type { ContentItem } from "@/lib/store/content";
import type { FormationSession } from "@/lib/programme/types";
import type { StudentProgress, StudentTodo } from "@/lib/programme/types";
import type { Enrollment } from "@/lib/types";
import {
  HelpPanel,
  Kpi,
  ProgressRing,
  SessionCard,
  TodoPanel,
} from "@/components/espace/shared";
import { formatSessionDateLabel } from "@/lib/store/sessions";

export function StudentDashboard({
  enrollment,
  progress,
  nextSession,
  todos,
  contents,
}: {
  enrollment: Enrollment;
  progress: StudentProgress;
  nextSession: FormationSession | null;
  todos: StudentTodo[];
  contents: ContentItem[];
}) {
  const currentModule = progress.currentModule;
  const nextPayment = getNextPayment(enrollment);

  const sessionKpi = nextSession
    ? new Date(`${nextSession.sessionDate}T12:00:00`).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })
    : "—";

  const sessionHint = nextSession
    ? `${formatSessionDateLabel(nextSession.sessionDate, enrollment.schedule).split(" ")[0]} · ${nextSession.hours}`
    : "Aucune séance planifiée";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_22%,transparent)] blur-3xl" />
          <p className="section-kicker">Tableau de bord</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Reprends où tu t&apos;es arrêté
          </h1>
          <p className="mt-3 max-w-xl text-[color:var(--neutral-600)]">
            {formation.title} · {formation.startLabel} → {formation.endLabel}. Les
            outils et codes se débloquent séance après séance.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/espace/programme" className="btn-primary">
              Continuer le module
            </Link>
            <Link href="/espace/ressources" className="btn-ghost">
              Voir les ressources
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[#171d17] p-6 text-[#fbfaf4]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent)]">
            Progression globale
          </p>
          <div className="mt-5 flex items-center gap-5">
            <ProgressRing value={progress.overallProgress} />
            <div>
              <p className="text-3xl font-semibold">{progress.overallProgress}%</p>
              <p className="mt-1 text-sm text-white/55">
                {progress.completedLessons} / {progress.totalLessons} leçons
              </p>
              <p className="mt-2 text-xs text-white/40">
                {progress.lockedCount} éléments encore verrouillés
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Prochaine séance" value={sessionKpi} hint={sessionHint} />
        <Kpi
          label="Module actif"
          value={currentModule?.monthLabel.split("·")[0]?.trim() ?? "—"}
          hint={currentModule?.title ?? "Programme en préparation"}
        />
        <Kpi
          label="Ressources"
          value={String(contents.length)}
          hint={contents.length ? "Nouveautés dispo" : "Bientôt publiées"}
        />
        <Kpi
          label="Prochain paiement"
          value={nextPayment ? nextPayment.amount : "—"}
          hint={nextPayment ? nextPayment.label : "Tout est à jour"}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        {nextSession ? (
          <SessionCard session={nextSession} schedule={enrollment.schedule} />
        ) : (
          <section className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--neutral-500)]">
              Prochaine séance
            </p>
            <p className="mt-2 text-sm text-[color:var(--neutral-600)]">
              Aucune séance planifiée pour ton créneau pour le moment.
            </p>
          </section>
        )}

        <div className="space-y-6">
          <TodoPanel todos={todos} />
          <HelpPanel />
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/espace/programme", label: "Mon programme", hint: "Modules & leçons" },
          { href: "/espace/ressources", label: "Ressources", hint: "Outils & codes" },
          { href: "/espace/paiements", label: "Paiements", hint: "Échéancier" },
          { href: "/espace/tests", label: "Tests", hint: "Quiz & validation" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 transition hover:border-[color:var(--accent)]"
          >
            <p className="font-medium text-[color:var(--neutral-black)]">{item.label}</p>
            <p className="mt-1 text-sm text-[color:var(--neutral-500)]">{item.hint}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
