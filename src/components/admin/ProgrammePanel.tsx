"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/espace/shared";
import type { FormationLesson, FormationModule } from "@/lib/programme/types";

export function ProgrammePanel({
  modules,
  lessons,
}: {
  modules: FormationModule[];
  lessons: FormationLesson[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [moduleForm, setModuleForm] = useState({ monthLabel: "", title: "" });
  const [lessonForm, setLessonForm] = useState({
    moduleId: modules[0]?.id ?? "",
    title: "",
    type: "séance" as FormationLesson["type"],
    duration: "5h",
    body: "",
  });

  async function apiCall(payload: Record<string, unknown>) {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/programme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setMessage("Enregistré.");
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  const sortedModules = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        kicker="Programme"
        title="Modules & leçons"
        description="C'est exactement ce que les apprenants voient dans Mon programme. Ajoute ou modifie les modules, leçons et tests ici."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <section className="space-y-6">
          <FormCard title="Nouveau module">
            <div className="grid gap-3">
              <input
                className="input-field"
                placeholder="Mois 1 · Octobre"
                value={moduleForm.monthLabel}
                onChange={(e) => setModuleForm((f) => ({ ...f, monthLabel: e.target.value }))}
              />
              <input
                className="input-field"
                placeholder="Titre du module"
                value={moduleForm.title}
                onChange={(e) => setModuleForm((f) => ({ ...f, title: e.target.value }))}
              />
              <button
                type="button"
                disabled={loading}
                className="btn-primary w-fit"
                onClick={() =>
                  apiCall({
                    action: "createModule",
                    monthLabel: moduleForm.monthLabel,
                    title: moduleForm.title,
                  })
                }
              >
                Ajouter le module
              </button>
            </div>
          </FormCard>

          <FormCard title="Nouvelle leçon">
            <div className="grid gap-3">
              <select
                className="input-field"
                value={lessonForm.moduleId}
                onChange={(e) => setLessonForm((f) => ({ ...f, moduleId: e.target.value }))}
              >
                {sortedModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.monthLabel} — {m.title}
                  </option>
                ))}
              </select>
              <input
                className="input-field"
                placeholder="Titre de la leçon"
                value={lessonForm.title}
                onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  className="input-field"
                  value={lessonForm.type}
                  onChange={(e) =>
                    setLessonForm((f) => ({
                      ...f,
                      type: e.target.value as FormationLesson["type"],
                    }))
                  }
                >
                  <option value="séance">Séance</option>
                  <option value="outil">Outil</option>
                  <option value="code">Code</option>
                  <option value="test">Test</option>
                </select>
                <input
                  className="input-field"
                  placeholder="Durée (ex. 5h)"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm((f) => ({ ...f, duration: e.target.value }))}
                />
              </div>
              <textarea
                className="input-field resize-y"
                rows={3}
                placeholder="Contenu / consignes (surtout pour les tests)"
                value={lessonForm.body}
                onChange={(e) => setLessonForm((f) => ({ ...f, body: e.target.value }))}
              />
              <button
                type="button"
                disabled={loading || !lessonForm.moduleId}
                className="btn-primary w-fit"
                onClick={() =>
                  apiCall({
                    action: "createLesson",
                    ...lessonForm,
                  })
                }
              >
                Ajouter la leçon
              </button>
            </div>
          </FormCard>

          {message ? (
            <p className="rounded-lg bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e5a36]">{message}</p>
          ) : null}
          {error ? (
            <p className="rounded-lg bg-[#fce8e8] px-3 py-2 text-sm text-[color:var(--error)]">
              {error}
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          {sortedModules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-50)] px-6 py-16 text-center">
              <p className="font-display text-xl">Aucun module</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--neutral-500)]">
                Crée ton premier module pour structurer le programme visible par les apprenants.
              </p>
            </div>
          ) : (
            sortedModules.map((mod) => {
              const modLessons = lessons
                .filter((l) => l.moduleId === mod.id)
                .sort((a, b) => a.sortOrder - b.sortOrder);

              return (
                <article
                  key={mod.id}
                  className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent-dark)]">
                        {mod.monthLabel}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">{mod.title}</h3>
                    </div>
                    <button
                      type="button"
                      className="text-xs text-[color:var(--error)] hover:underline"
                      onClick={() => {
                        if (confirm("Supprimer ce module et toutes ses leçons ?")) {
                          apiCall({ action: "deleteModule", id: mod.id });
                        }
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                  <ul className="divide-y divide-[color:var(--border)]">
                    {modLessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 px-5 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{lesson.title}</p>
                          <p className="text-xs text-[color:var(--neutral-500)]">
                            {lesson.type} · {lesson.duration}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-xs text-[color:var(--error)] hover:underline"
                          onClick={() => {
                            if (confirm("Supprimer cette leçon ?")) {
                              apiCall({ action: "deleteLesson", id: lesson.id });
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </li>
                    ))}
                    {modLessons.length === 0 ? (
                      <li className="px-5 py-4 text-sm text-[color:var(--neutral-500)]">
                        Aucune leçon dans ce module.
                      </li>
                    ) : null}
                  </ul>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
      <h2 className="font-display text-xl tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}
