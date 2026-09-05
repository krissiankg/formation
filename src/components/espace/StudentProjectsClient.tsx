"use client";

import { useState } from "react";
import type { StudentProject, ProjectStatus } from "@/lib/types";

export function StudentProjectsClient({
  initialProjects,
}: {
  initialProjects: StudentProject[];
}) {
  const [projects, setProjects] = useState<StudentProject[]>(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoCredentials, setDemoCredentials] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          projectUrl,
          githubUrl: githubUrl || undefined,
          demoCredentials: demoCredentials || undefined,
          description: description || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la soumission");

      setProjects([data.project, ...projects]);
      setSuccess("Projet soumis avec succès ! Le formateur a été notifié sur WhatsApp.");
      setTitle("");
      setProjectUrl("");
      setGithubUrl("");
      setDemoCredentials("");
      setDescription("");
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-[color:var(--neutral-black)]">
            Mes Projets &amp; Livrables SaaS
          </h2>
          <p className="mt-1 text-sm text-[color:var(--neutral-600)]">
            Dépose tes applications et sites en ligne pour validation par le formateur.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn-primary text-sm !py-2.5 !px-5 shrink-0"
        >
          <span>🚀</span>
          <span>Soumettre un projet</span>
        </button>
      </div>

      {success ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-800">
          {success}
        </div>
      ) : null}

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-50)] p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[color:var(--accent-lightest)] text-2xl">
            🛠️
          </div>
          <h3 className="font-display mt-4 text-lg font-semibold">Aucun projet soumis pour l&apos;instant</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--neutral-500)]">
            Dès que tu as créé ta première application, ton SaaS ou ton prototype avec l&apos;IA, dépose son lien ici pour recevoir ton évaluation détaillée.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="btn-primary mt-6 text-sm"
          >
            Déposer mon premier SaaS
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 transition duration-200 hover:border-[color:var(--accent)]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-[color:var(--neutral-black)]">
                      {proj.title}
                    </h3>
                    <p className="mt-1 text-xs text-[color:var(--neutral-500)]">
                      Soumis le {new Date(proj.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <ProjectStatusBadge status={proj.status} />
                </div>

                {proj.description ? (
                  <p className="mt-3 text-sm text-[color:var(--neutral-600)] leading-relaxed">
                    {proj.description}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <a
                    href={proj.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3 py-1.5 font-medium text-[color:var(--neutral-black)] hover:border-[color:var(--accent)]"
                  >
                    <span>🌐 Tester le site</span>
                    <span>↗</span>
                  </a>
                  {proj.githubUrl ? (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3 py-1.5 font-medium text-[color:var(--neutral-black)] hover:border-[color:var(--accent)]"
                    >
                      <span>💻 Code GitHub</span>
                      <span>↗</span>
                    </a>
                  ) : null}
                </div>

                {proj.demoCredentials ? (
                  <div className="mt-3 rounded-lg bg-[color:var(--neutral-100)] p-2.5 text-xs text-[color:var(--neutral-600)]">
                    <span className="font-medium text-[color:var(--neutral-black)]">Accès test : </span>
                    {proj.demoCredentials}
                  </div>
                ) : null}
              </div>

              {/* Feedback du formateur */}
              {proj.reviewedAt || proj.feedback ? (
                <div className="mt-6 rounded-xl border border-[color:var(--border-light)] bg-[color:var(--neutral-100)] p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-wider font-semibold text-[color:var(--accent-dark)]">
                      Retour du formateur
                    </p>
                    {proj.score !== null && proj.score !== undefined ? (
                      <span className="font-display font-bold text-sm text-[color:var(--neutral-black)]">
                        Note : {proj.score}/100
                      </span>
                    ) : null}
                  </div>
                  {proj.feedback ? (
                    <p className="mt-2 text-sm italic text-[color:var(--neutral-700)]">
                      « {proj.feedback} »
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-6 text-xs text-[color:var(--neutral-500)] italic">
                  ⏳ En attente de passage en revue par le formateur.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de soumission */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 shadow-2xl sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-bold">Soumettre mon projet SaaS</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-lg text-[color:var(--neutral-500)] hover:text-black"
              >
                ✕
              </button>
            </div>

            {error ? (
              <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                  Nom du projet / SaaS *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : FacturaAI, AutoLead Bénin, FastResume..."
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                  URL du site en ligne (Production) *
                </label>
                <input
                  type="url"
                  required
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://mon-application.vercel.app"
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                  Lien GitHub (Code source - optionnel)
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/mon-profil/mon-saas"
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                  Identifiants de test démo (optionnel)
                </label>
                <input
                  type="text"
                  value={demoCredentials}
                  onChange={(e) => setDemoCredentials(e.target.value)}
                  placeholder="ex: admin@test.com / demo1234"
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--neutral-700)]">
                  Description / Fonctionnalités clés
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique brièvement ce que fait ton SaaS et les outils IA utilisés..."
                  className="mt-1.5 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-3.5 py-2.5 text-sm outline-none focus:border-[color:var(--accent)]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost !px-4 !py-2 text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary !px-5 !py-2 text-sm"
                >
                  {submitting ? "Envoi en cours..." : "Soumettre au formateur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-800">
          ✅ Validé
        </span>
      );
    case "changes_requested":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 font-mono text-[11px] font-semibold text-amber-900">
          ⚠️ Retouches demandées
        </span>
      );
    case "in_review":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-3 py-1 font-mono text-[11px] font-semibold text-blue-900">
          🔍 En cours d'analyse
        </span>
      );
    case "submitted":
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-500/15 px-3 py-1 font-mono text-[11px] font-semibold text-neutral-800">
          ⏳ Soumis
        </span>
      );
  }
}
