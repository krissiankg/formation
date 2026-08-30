"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/espace/shared";
import { formation } from "@/lib/config/formation";
import type { FormationLesson } from "@/lib/programme/types";
import type { FormationSession } from "@/lib/programme/types";
import { formatSessionDateLabel } from "@/lib/store/sessions";

export function SessionsPanel({
  sessions,
  lessons,
}: {
  sessions: FormationSession[];
  lessons: FormationLesson[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    sessionDate: string;
    hours: string;
    location: string;
    schedule: FormationSession["schedule"];
    lessonId: string;
  }>({
    title: "",
    sessionDate: "",
    hours: formation.schedule.saturday.hours,
    location: formation.location,
    schedule: "both",
    lessonId: "",
  });

  async function createSession() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...form,
          lessonId: form.lessonId || null,
        }),
      });
      if (res.ok) {
        setForm((f) => ({ ...f, title: "", sessionDate: "" }));
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function deleteSession(id: string) {
    if (!confirm("Supprimer cette séance ?")) return;
    setLoading(true);
    try {
      await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        kicker="Séances"
        title="Planning présentiel"
        description="Les apprenants voient la prochaine séance sur leur tableau de bord, filtrée par créneau (samedi / dimanche)."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
          <h2 className="font-display text-xl">Nouvelle séance</h2>
          <div className="mt-4 grid gap-3">
            <input
              className="input-field"
              placeholder="Titre"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <input
              type="date"
              className="input-field"
              value={form.sessionDate}
              onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Horaires"
              value={form.hours}
              onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
            />
            <input
              className="input-field"
              placeholder="Lieu"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
            <select
              className="input-field"
              value={form.schedule}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  schedule: e.target.value as FormationSession["schedule"],
                }))
              }
            >
              <option value="both">Samedi & dimanche</option>
              <option value="saturday">Samedi seulement</option>
              <option value="sunday">Dimanche seulement</option>
            </select>
            <select
              className="input-field"
              value={form.lessonId}
              onChange={(e) => setForm((f) => ({ ...f, lessonId: e.target.value }))}
            >
              <option value="">Lier à une leçon (optionnel)</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-primary w-fit"
              disabled={loading || !form.title || !form.sessionDate}
              onClick={createSession}
            >
              Ajouter la séance
            </button>
          </div>
        </section>

        <section className="space-y-3">
          {sessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-50)] px-6 py-16 text-center">
              <p className="font-medium">Aucune séance planifiée</p>
            </div>
          ) : (
            sessions.map((session) => (
              <article
                key={session.id}
                className="rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent-darkest)]">
                      {session.schedule === "both"
                        ? "Tous créneaux"
                        : session.schedule === "saturday"
                          ? "Samedi"
                          : "Dimanche"}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{session.title}</h3>
                    <p className="mt-2 text-sm text-[color:var(--neutral-600)]">
                      {formatSessionDateLabel(session.sessionDate, "saturday")} · {session.hours}
                    </p>
                    <p className="text-sm text-[color:var(--neutral-500)]">{session.location}</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs text-[color:var(--error)] hover:underline"
                    onClick={() => deleteSession(session.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
