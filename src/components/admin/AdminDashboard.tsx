import Link from "next/link";
import { formation } from "@/lib/config/formation";
import { formatFcfa } from "@/lib/format";
import type { Enrollment } from "@/lib/types";
import type { ContentItem } from "@/lib/store/content";
import { Kpi } from "@/components/espace/shared";
import { getAdminStats } from "@/components/admin/admin-stats";
import { EnrollmentRow } from "@/components/admin/EnrollmentRow";
import { ContentKindBadge } from "@/components/admin/ContentKindBadge";

export function AdminDashboard({
  enrollments,
  contents,
}: {
  enrollments: Enrollment[];
  contents: ContentItem[];
}) {
  const stats = getAdminStats(enrollments, contents);
  const fillRate =
    stats.total > 0 ? Math.round((stats.paidCount / stats.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 sm:p-7">
          <div className="pointer-events-none absolute -right-10 -top-12 size-44 rounded-full bg-[color:color-mix(in_srgb,var(--accent)_22%,transparent)] blur-3xl" />
          <p className="section-kicker">Administration</p>
          <h1 className="font-display mt-2 text-3xl tracking-tight sm:text-4xl">
            Pilote ta cohorte
          </h1>
          <p className="mt-3 max-w-xl text-[color:var(--neutral-600)]">
            {formation.title} · {formation.startLabel} → {formation.endLabel}. Suis les
            inscriptions, publie des ressources et notifie les apprenants sur WhatsApp.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/contenus" className="btn-primary">
              Publier une ressource
            </Link>
            <Link href="/admin/tests" className="btn-ghost">
              Gérer les tests & quiz
            </Link>
            <Link href="/admin/programme" className="btn-ghost">
              Gérer le programme
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[#171d17] p-6 text-[#fbfaf4]">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent)]">
            Inscriptions payées
          </p>
          <div className="mt-5">
            <p className="text-4xl font-semibold tracking-tight">{stats.paidCount}</p>
            <p className="mt-2 text-sm text-white/55">
              sur {stats.total} inscription{stats.total !== 1 ? "s" : ""} · {fillRate}%
              converties
            </p>
            <p className="mt-4 text-2xl font-medium text-[color:var(--accent-light)]">
              {formatFcfa(stats.revenue)}
            </p>
            <p className="mt-1 text-xs text-white/40">Frais d&apos;inscription encaissés</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Inscrits" value={String(stats.total)} hint="Total formulaires" />
        <Kpi
          label="En attente"
          value={String(stats.pendingCount)}
          hint="Paiement non confirmé"
        />
        <Kpi
          label="Créneaux"
          value={`${stats.saturday} / ${stats.sunday}`}
          hint="Samedi · Dimanche"
        />
        <Kpi
          label="Contenus"
          value={String(stats.published)}
          hint={`${stats.draftCount} brouillon(s)`}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl tracking-tight">Dernières inscriptions</h2>
            <Link href="/admin/inscrits" className="text-sm accent-text hover:underline">
              Tout voir
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-100)] px-5 py-10 text-center">
              <p className="font-medium">Aucune inscription</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[color:var(--neutral-500)]">
                Les nouvelles inscriptions apparaîtront ici avec leur statut de paiement.
              </p>
            </div>
          ) : (
            <ul className="mt-5 divide-y divide-[color:var(--border)] rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)]">
              {stats.recent.map((e) => (
                <EnrollmentRow key={e.id} enrollment={e} compact />
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5">
            <h2 className="font-display text-xl">Actions rapides</h2>
            <ul className="mt-4 space-y-2">
              {[
                { href: "/admin/contenus", label: "Publier un outil ou une annonce" },
                { href: "/admin/programme", label: "Modifier le programme" },
                { href: "/admin/seances", label: "Planifier une séance" },
                { href: "/admin/inscrits", label: "Voir les inscrits" },
                {
                  href: "https://supabase.guelichweb.store/login/",
                  label: "Ouvrir Supabase (BDD)",
                  external: true,
                },
              ].map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-4 py-3 text-sm transition hover:border-[color:var(--accent)]"
                    >
                      {item.label}
                      <span className="text-[color:var(--neutral-400)]">↗</span>
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-4 py-3 text-sm transition hover:border-[color:var(--accent)]"
                    >
                      {item.label}
                      <span className="text-[color:var(--neutral-400)]">→</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[#171d17] p-5 text-[#fbfaf4]">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[color:var(--accent)]">
              Notifications
            </p>
            <p className="mt-2 text-sm text-white/65">
              Chaque inscription payée et chaque contenu publié peut déclencher un WhatsApp
              automatique (admin + apprenants).
            </p>
            <p className="mt-3 text-xs text-white/40">
              Instance Evolution : forgeia · connectée
            </p>
          </section>
        </div>
      </div>

      {stats.recentContent.length > 0 ? (
        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl tracking-tight">Contenus récents</h2>
            <Link href="/admin/contenus" className="text-sm accent-text hover:underline">
              Gérer
            </Link>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {stats.recentContent.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <ContentKindBadge kind={c.kind} />
                  <span className="text-[11px] text-[color:var(--neutral-500)]">
                    {c.published ? "Publié" : "Brouillon"}
                  </span>
                </div>
                <p className="mt-2 font-medium">{c.title}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
