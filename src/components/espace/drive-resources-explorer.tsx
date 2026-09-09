"use client";

import { useEffect, useMemo, useState } from "react";

interface DriveResourceFile {
  id: string;
  name: string;
  size?: number;
  formattedSize: string;
  modifiedTime?: string;
  isZip: boolean;
}

export function DriveResourcesExplorer() {
  const [files, setFiles] = useState<DriveResourceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyZip, setOnlyZip] = useState(true);

  useEffect(() => {
    async function fetchFiles() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/ressources/drive");
        if (!res.ok) {
          throw new Error("Impossible de charger les fichiers");
        }
        const data = await res.json();
        if (data.configured === false) {
          setConfigured(false);
          setFiles([]);
        } else {
          setConfigured(true);
          setFiles(data.files || []);
        }
      } catch (err) {
        setError((err as Error).message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
  }, []);

  const filteredFiles = useMemo(() => {
    let result = files;

    if (onlyZip) {
      result = result.filter((f) => f.isZip);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((f) => f.name.toLowerCase().includes(q));
    }

    return result;
  }, [files, search, onlyZip]);

  const zipCount = useMemo(() => files.filter((f) => f.isZip).length, [files]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-6 text-[color:var(--neutral-black)] sm:p-8 shadow-sm">
      {/* En-tête du module */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent-lightest)] px-3 py-1 font-mono text-xs font-semibold text-[color:var(--accent-darkest)]">
              <span className="size-2 rounded-full bg-[color:var(--accent)] animate-pulse" />
              Drive Privé Connecté
            </span>
            <span className="rounded-full bg-[color:var(--neutral-100)] px-2.5 py-1 font-mono text-xs font-medium text-[color:var(--neutral-600)]">
              Accès Étudiant Direct
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Projets & Ressources ZIP
          </h2>
          <p className="max-w-2xl text-sm text-[color:var(--neutral-600)]">
            Recherche et télécharge en un clic les templates de projets, starters et archives du dossier partagé de la formation.
          </p>
        </div>

        {/* Badge récapitulatif */}
        {!loading && configured && (
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-4 py-2 text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--neutral-500)]">
              Fichiers disponibles
            </p>
            <p className="font-mono text-lg font-bold text-[color:var(--accent-darkest)]">
              {zipCount} {zipCount > 1 ? "archives ZIP" : "archive ZIP"}
            </p>
          </div>
        )}
      </div>

      {/* Barre de recherche et filtres */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[color:var(--neutral-400)]">
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un fichier ZIP (ex: boilerplate, saas, auth, module...)"
            className="w-full rounded-xl border border-[color:var(--border)] bg-white py-2.5 pl-10 pr-10 text-sm placeholder:text-[color:var(--neutral-400)] focus:border-[color:var(--accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-[color:var(--neutral-400)] hover:text-[color:var(--neutral-700)]"
              title="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtre toggle ZIP / Tous */}
        <div className="flex items-center gap-1.5 self-start rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-1 text-xs">
          <button
            onClick={() => setOnlyZip(true)}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              onlyZip
                ? "bg-white text-[color:var(--neutral-black)] shadow-xs"
                : "text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-black)]"
            }`}
          >
            Fichiers .ZIP ({zipCount})
          </button>
          <button
            onClick={() => setOnlyZip(false)}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              !onlyZip
                ? "bg-white text-[color:var(--neutral-black)] shadow-xs"
                : "text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-black)]"
            }`}
          >
            Tous les fichiers ({files.length})
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="mt-6">
        {loading ? (
          /* Skeletons */
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-[color:var(--border)] bg-white p-4">
                <div className="h-4 w-3/4 rounded bg-[color:var(--neutral-200)]" />
                <div className="mt-3 flex items-center justify-between">
                  <div className="h-3 w-16 rounded bg-[color:var(--neutral-100)]" />
                  <div className="h-8 w-24 rounded bg-[color:var(--neutral-200)]" />
                </div>
              </div>
            ))}
          </div>
        ) : !configured ? (
          /* Non encore connecté */
          <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-100)] p-8 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[color:var(--accent-lightest)] text-[color:var(--accent-darkest)]">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="mt-3 font-medium text-[color:var(--neutral-black)]">
              Dossier en attente de synchronisation
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-[color:var(--neutral-500)]">
              Le dossier partagé est en cours d&apos;autorisation par le formateur. Les fichiers ZIP apparaîtront automatiquement ici dès la validation.
            </p>
          </div>
        ) : error ? (
          /* Erreur */
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Erreur de chargement</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          /* Aucun résultat */
          <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-white p-8 text-center">
            <p className="text-sm font-medium text-[color:var(--neutral-700)]">
              Aucun fichier trouvé pour &laquo; {search} &raquo;
            </p>
            <p className="mt-1 text-xs text-[color:var(--neutral-400)]">
              Vérifie l&apos;orthographe ou efface ta recherche pour voir l&apos;ensemble des fichiers disponibles.
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-3 inline-flex items-center rounded-lg bg-[color:var(--neutral-100)] px-3 py-1.5 text-xs font-medium text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-200)]"
              >
                Réinitialiser la recherche
              </button>
            )}
          </div>
        ) : (
          /* Liste des fichiers trouvés */
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredFiles.map((file) => {
              const formattedDate = file.modifiedTime
                ? new Date(file.modifiedTime).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              return (
                <div
                  key={file.id}
                  className="flex flex-col justify-between rounded-xl border border-[color:var(--border)] bg-white p-4 shadow-2xs transition hover:border-[color:var(--accent)] hover:shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {/* Icône ZIP ou fichier */}
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-lightest)] text-[color:var(--accent-darkest)]">
                      {file.isZip ? (
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                          />
                        </svg>
                      ) : (
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Nom et métadonnées */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-semibold text-[color:var(--neutral-black)]"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[color:var(--neutral-500)]">
                        <span className="font-mono font-medium text-[color:var(--accent-darkest)]">
                          {file.formattedSize}
                        </span>
                        {formattedDate && (
                          <>
                            <span>·</span>
                            <span>{formattedDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bouton de téléchargement direct */}
                  <div className="mt-4 flex items-center justify-end border-t border-[color:var(--border)]/60 pt-3">
                    <a
                      href={`/api/ressources/drive/download/${file.id}`}
                      download={file.name}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[color:var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:opacity-90 active:scale-95"
                    >
                      <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Télécharger
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note d'information */}
      <div className="mt-6 border-t border-[color:var(--border)] pt-4 text-xs text-[color:var(--neutral-500)]">
        💡 <strong>Astuce :</strong> Tous les fichiers sont téléchargés directement depuis la plateforme sans passer par Google Drive. Si tu as un souci pour décompresser une archive, contacte le formateur sur WhatsApp.
      </div>
    </div>
  );
}
