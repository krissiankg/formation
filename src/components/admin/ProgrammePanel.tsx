"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/espace/shared";
import { LESSON_TYPES, LESSON_TYPE_LABELS } from "@/lib/programme/lesson-types";
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
  const [editingModule, setEditingModule] = useState<{ id: string; monthLabel: string; title: string } | null>(null);
  const [lessonForm, setLessonForm] = useState({
    moduleId: modules[0]?.id ?? "",
    title: "",
    type: "séance" as FormationLesson["type"],
    duration: "4h30",
  });

  async function apiCall<T = Record<string, unknown>>(payload: Record<string, unknown>, success = "Enregistré.") {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/programme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as T & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return null;
      }
      setMessage(success);
      router.refresh();
      return data;
    } catch {
      setError("Erreur réseau");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function createLessonAndEdit() {
    const data = await apiCall<{ lesson?: FormationLesson }>({ action: "createLesson", ...lessonForm, body: "" });
    if (data?.lesson) router.push(`/admin/programme/${data.lesson.id}`);
  }

  const sortedModules = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        kicker="Programme"
        title="Modules & leçons"
        description="C'est exactement ce que les apprenants voient dans Mon programme. Clique sur une leçon pour modifier son contenu."
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.4fr] [&>*]:min-w-0">
        <section className="space-y-6">
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
              <div className="grid gap-3 sm:grid-cols-2 [&>*]:min-w-0">
                <select
                  className="input-field"
                  value={lessonForm.type}
                  onChange={(e) => setLessonForm((f) => ({ ...f, type: e.target.value as FormationLesson["type"] }))}
                >
                  {LESSON_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {LESSON_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                <input
                  className="input-field"
                  placeholder="Durée (ex. 4h30, 30 min)"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm((f) => ({ ...f, duration: e.target.value }))}
                />
              </div>
              <button
                type="button"
                disabled={loading || !lessonForm.moduleId || !lessonForm.title.trim()}
                className="btn-primary w-fit"
                onClick={() => void createLessonAndEdit()}
              >
                Créer et écrire le contenu →
              </button>
            </div>
          </FormCard>

          <FormCard title="Nouveau module">
            <div className="grid gap-3">
              <input
                className="input-field"
                placeholder="Mois 3 · Janvier"
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
                disabled={loading || !moduleForm.monthLabel.trim() || !moduleForm.title.trim()}
                className="btn-primary w-fit"
                onClick={async () => {
                  const ok = await apiCall({ action: "createModule", ...moduleForm }, "Module ajouté.");
                  if (ok) setModuleForm({ monthLabel: "", title: "" });
                }}
              >
                Ajouter le module
              </button>
            </div>
          </FormCard>

          {message ? <p className="rounded-lg bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e5a36]">{message}</p> : null}
          {error ? (
            <p className="rounded-lg bg-[#fce8e8] px-3 py-2 text-sm text-[color:var(--error)]">{error}</p>
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
            sortedModules.map((mod, modIndex) => {
              const modLessons = lessons
                .filter((l) => l.moduleId === mod.id)
                .sort((a, b) => a.sortOrder - b.sortOrder);
              const isEditing = editingModule?.id === mod.id;

              return (
                <article
                  key={mod.id}
                  className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[color:var(--border)] px-5 py-4">
                    {isEditing ? (
                      <div className="grid flex-1 gap-2">
                        <input
                          className="input-field"
                          value={editingModule.monthLabel}
                          onChange={(e) => setEditingModule({ ...editingModule, monthLabel: e.target.value })}
                        />
                        <input
                          className="input-field"
                          value={editingModule.title}
                          onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-primary !py-1.5 text-xs"
                            disabled={loading}
                            onClick={async () => {
                              const ok = await apiCall({ action: "updateModule", ...editingModule });
                              if (ok) setEditingModule(null);
                            }}
                          >
                            Enregistrer
                          </button>
                          <button type="button" className="text-xs hover:underline" onClick={() => setEditingModule(null)}>
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent-dark)]">
                          {mod.monthLabel}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">{mod.title}</h3>
                      </div>
                    )}
                    {!isEditing ? (
                      <div className="flex items-center gap-1">
                        <MoveButtons
                          disabled={loading}
                          canUp={modIndex > 0}
                          canDown={modIndex < sortedModules.length - 1}
                          onMove={(direction) => apiCall({ action: "moveModule", id: mod.id, direction }, "Ordre mis à jour.")}
                        />
                        <button
                          type="button"
                          className="px-2 text-xs hover:underline"
                          onClick={() => setEditingModule({ id: mod.id, monthLabel: mod.monthLabel, title: mod.title })}
                        >
                          Renommer
                        </button>
                        <button
                          type="button"
                          className="px-2 text-xs text-[color:var(--error)] hover:underline"
                          onClick={() => {
                            if (confirm("Supprimer ce module et TOUTES ses leçons ? Cette action est définitive.")) {
                              void apiCall({ action: "deleteModule", id: mod.id }, "Module supprimé.");
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <ul className="divide-y divide-[color:var(--border)]">
                    {modLessons.map((lesson, index) => (
                      <li key={lesson.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <Link href={`/admin/programme/${lesson.id}`} className="group min-w-0 flex-1">
                          <p className="truncate text-sm font-medium group-hover:text-[color:var(--accent-dark)] group-hover:underline">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-[color:var(--neutral-500)]">
                            {LESSON_TYPE_LABELS[lesson.type] ?? lesson.type} · {lesson.duration}
                            {lesson.body.trim() ? "" : " · ⚠️ contenu vide"}
                          </p>
                        </Link>
                        <div className="flex shrink-0 items-center gap-1">
                          <MoveButtons
                            disabled={loading}
                            canUp={index > 0}
                            canDown={index < modLessons.length - 1}
                            onMove={(direction) =>
                              apiCall({ action: "moveLesson", id: lesson.id, direction }, "Ordre mis à jour.")
                            }
                          />
                          <Link href={`/admin/programme/${lesson.id}`} className="px-2 text-xs accent-text hover:underline">
                            Modifier
                          </Link>
                          <button
                            type="button"
                            className="px-2 text-xs text-[color:var(--error)] hover:underline"
                            onClick={() => {
                              if (confirm(`Supprimer la leçon « ${lesson.title} » ? Cette action est définitive.`)) {
                                void apiCall({ action: "deleteLesson", id: lesson.id }, "Leçon supprimée.");
                              }
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </li>
                    ))}
                    {modLessons.length === 0 ? (
                      <li className="px-5 py-4 text-sm text-[color:var(--neutral-500)]">Aucune leçon dans ce module.</li>
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

function MoveButtons({
  canUp,
  canDown,
  disabled,
  onMove,
}: {
  canUp: boolean;
  canDown: boolean;
  disabled: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const cls =
    "flex size-7 items-center justify-center rounded-md border border-[color:var(--border)] text-xs hover:border-[color:var(--accent)] disabled:opacity-30";
  return (
    <>
      <button type="button" title="Monter" className={cls} disabled={disabled || !canUp} onClick={() => onMove(-1)}>
        ↑
      </button>
      <button type="button" title="Descendre" className={cls} disabled={disabled || !canDown} onClick={() => onMove(1)}>
        ↓
      </button>
    </>
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
