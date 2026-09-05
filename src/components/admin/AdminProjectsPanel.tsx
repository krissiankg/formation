"use client";

import { useState } from "react";
import type { StudentProject, ProjectStatus } from "@/lib/types";

export function AdminProjectsPanel({ initialProjects }: { initialProjects: StudentProject[] }) {
  const [projects, setProjects] = useState<StudentProject[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<StudentProject | null>(null);
  const [status, setStatus] = useState<ProjectStatus>("approved");
  const [score, setScore] = useState<number | string>(85);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function openReview(proj: StudentProject) {
    setSelectedProject(proj);
    setStatus(proj.status === "submitted" ? "approved" : proj.status);
    setScore(proj.score ?? 80);
    setFeedback(proj.feedback ?? "");
  }

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProject) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedProject.id,
          status,
          score: score !== "" ? Number(score) : undefined,
          feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'évaluation");

      setProjects(projects.map((p) => (p.id === data.project.id ? data.project : p)));
      setToast("✅ Évaluation enregistrée et notification WhatsApp envoyée à l'élève !");
      setSelectedProject(null);
      setTimeout(() => setToast(null), 5000);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[color:var(--neutral-black)]">
            Projets &amp; Livrables SaaS des Apprenants
          </h2>
          <p className="mt-1 text-sm text-[color:var(--neutral-600)]">
            Évaluez les projets SaaS soumis, donnez un score, un feedback et notifiez l'élève automatiquement par WhatsApp.
          </p>
        </div>
      </div>

      {toast ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-800">
          {toast}
        </div>
      ) : null}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-50)] p-12 text-center">
          <p className="font-display text-lg font-semibold">Aucun projet soumis pour le moment</p>
          <p className="mt-1 text-sm text-[color:var(--neutral-500)]">
            Les projets créés par les apprenants apparaîtront ici au fil de leur formation.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[color:var(--neutral-100)] font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--neutral-500)]">
                <tr>
                  <th className="px-4 py-3 font-medium">Apprenant</th>
                  <th className="px-4 py-3 font-medium">Projet SaaS</th>
                  <th className="px-4 py-3 font-medium">Liens</th>
                  <th className="px-4 py-3 font-medium">Statut</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--border)]">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-[color:var(--neutral-100)]/80 transition">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[color:var(--neutral-black)]">{proj.studentName || "Apprenant"}</p>
                      <p className="text-xs font-mono text-[color:var(--neutral-500)]">{proj.studentWhatsapp}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-[color:var(--neutral-black)]">{proj.title}</p>
                      {proj.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--neutral-500)]">{proj.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 space-x-2">
                      <a
                        href={proj.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-[color:var(--neutral-100)] px-2 py-1 text-xs font-medium text-[color:var(--neutral-black)] hover:bg-[color:var(--accent-lightest)] hover:text-[color:var(--accent-dark)]"
                        title="Tester le site web"
                      >
                        Site ↗
                      </a>
                      {proj.githubUrl ? (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-[color:var(--neutral-100)] px-2 py-1 text-xs font-medium text-[color:var(--neutral-black)] hover:bg-[color:var(--accent-lightest)] hover:text-[color:var(--accent-dark)]"
                          title="Voir le code GitHub"
                        >
                          GitHub ↗
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <AdminStatusBadge status={proj.status} />
                    </td>
                    <td className="px-4 py-4 font-display font-semibold">
                      {proj.score !== null && proj.score !== undefined ? `${proj.score}/100` : "—"}
                    </td>
                    <td className="px-4 py-4 text-xs text-[color:var(--neutral-500)]">
                      {new Date(proj.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => openReview(proj)}
                        className="rounded-lg border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-3 py-1.5 text-xs font-semibold text-[color:var(--neutral-black)] hover:border-[color:var(--accent)] hover:bg-[color:var(--accent-lightest)] transition"
                      >
                        Évaluer / Noter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedProject ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold">Évaluer : {selectedProject.title}</h3>
                <p className="text-xs text-[color:var(--neutral-500)]">Apprenant : {selectedProject.studentName} ({selectedProject.studentWhatsapp})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="text-lg text-[color:var(--neutral-500)] hover:text-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                  Statut de validation *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                >
                  <option value="approved">✅ Validé (Projet approuvé)</option>
                  <option value="changes_requested">⚠️ Retouches demandées (Modifications requises)</option>
                  <option value="in_review">🔍 En cours d'analyse</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                  Note sur 100
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                  Commentaire &amp; Feedback du formateur
                </label>
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Points forts du SaaS, axes d'amélioration, conseils pour vendre..."
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="btn-ghost !px-4 !py-2 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary !px-5 !py-2 text-sm"
                >
                  {saving ? "Enregistrement..." : "Enregistrer & Alerter WhatsApp"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminStatusBadge({ status }: { status: ProjectStatus }) {
  switch (status) {
    case "approved":
      return <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-800">✅ Validé</span>;
    case "changes_requested":
      return <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-900">⚠️ Retouches</span>;
    case "in_review":
      return <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-900">🔍 En revue</span>;
    case "submitted":
    default:
      return <span className="rounded-full bg-neutral-500/15 px-2.5 py-1 text-xs font-semibold text-neutral-800">⏳ Soumis</span>;
  }
}
