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

  const [editing, setEditing] = useState<{
    id: string;
    title: string;
    sessionDate: string;
    hours: string;
    location: string;
    schedule: FormationSession["schedule"];
    lessonId: string;
  } | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  async function saveSession() {
    if (!editing) return;
    setLoading(true);
    setEditError(null);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update", ...editing, lessonId: editing.lessonId || null }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setEditError(data.error ?? "Enregistrement impossible.");
        return;
      }
      setEditing(null);
      router.refresh();
    } catch {
      setEditError("Erreur réseau.");
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

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] [&>*]:min-w-0">
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
              <option value="both">Toutes les classes</option>
              <option value="saturday">Samedi matin seulement</option>
              <option value="saturday_pm">Samedi après-midi seulement</option>
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
            sessions.map((session) =>
              editing?.id === session.id ? (
              <article
                key={session.id}
                className="grid gap-2 rounded-2xl border border-[color:var(--accent)] bg-[color:var(--neutral-50)] p-5"
              >
                <input
                  className="input-field"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="date"
                    className="input-field"
                    value={editing.sessionDate}
                    onChange={(e) => setEditing({ ...editing, sessionDate: e.target.value })}
                  />
                  <input
                    className="input-field"
                    value={editing.hours}
                    onChange={(e) => setEditing({ ...editing, hours: e.target.value })}
                  />
                </div>
                <input
                  className="input-field"
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    className="input-field"
                    value={editing.schedule}
                    onChange={(e) => setEditing({ ...editing, schedule: e.target.value as FormationSession["schedule"] })}
                  >
                    <option value="both">Toutes les classes</option>
                    <option value="saturday">Samedi matin seulement</option>
                    <option value="saturday_pm">Samedi après-midi seulement</option>
                    <option value="sunday">Dimanche seulement</option>
                  </select>
                  <select
                    className="input-field"
                    value={editing.lessonId}
                    onChange={(e) => setEditing({ ...editing, lessonId: e.target.value })}
                  >
                    <option value="">Aucune leçon liée</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                  </select>
                </div>
                {editError ? <p className="text-sm text-[color:var(--error)]">{editError}</p> : null}
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="btn-primary !py-2 text-sm"
                    disabled={loading || !editing.title || !editing.sessionDate}
                    onClick={() => void saveSession()}
                  >
                    Enregistrer
                  </button>
                  <button type="button" className="text-sm hover:underline" onClick={() => setEditing(null)}>
                    Annuler
                  </button>
                </div>
              </article>
              ) : (
              <article
                key={session.id}
                className="rounded-2xl border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent-darkest)]">
                      {session.schedule === "both"
                        ? "Tous créneaux"
                        : formation.schedule[session.schedule].label}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold">{session.title}</h3>
                    <p className="mt-2 text-sm text-[color:var(--neutral-600)]">
                      {formatSessionDateLabel(session.sessionDate, session.schedule === "both" ? "saturday" : session.schedule)} · {session.hours}
                    </p>
                    <p className="text-sm text-[color:var(--neutral-500)]">{session.location}</p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      className="text-xs accent-text hover:underline"
                      onClick={() => {
                        setEditError(null);
                        setEditing({
                          id: session.id,
                          title: session.title,
                          sessionDate: session.sessionDate,
                          hours: session.hours,
                          location: session.location,
                          schedule: session.schedule,
                          lessonId: session.lessonId ?? "",
                        });
                      }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      className="text-xs text-[color:var(--error)] hover:underline"
                      onClick={() => deleteSession(session.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </article>
              ),
            )
          )}
        </section>
      </div>
    </div>
  );
}
