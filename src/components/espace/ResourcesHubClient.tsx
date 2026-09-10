"use client";

import { useState } from "react";
import { DriveResourcesExplorer } from "@/components/espace/drive-resources-explorer";
import { ResourcesPanel } from "@/components/espace/shared";

interface ResourcesHubClientProps {
  studentApiKey: string;
  contents: any[];
}

type TabType = "templates" | "devtools" | "course-docs";

export function ResourcesHubClient({ studentApiKey, contents }: ResourcesHubClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("templates");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  function copyToClipboard(text: string, type: "key" | "url") {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  }

  const publishedCount = contents.filter((c) => c.status === "published").length;

  return (
    <div className="space-y-6">
      {/* En-tête Hub Élégant */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[color:var(--border)]/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)]/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[color:var(--accent-darkest)]">
              <span className="size-1.5 rounded-full bg-[color:var(--accent)]" />
              Espace Ressources Pro
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[color:var(--neutral-black)] mt-1.5">
            Hub Outils, IA & Templates
          </h1>
          <p className="text-xs sm:text-sm text-[color:var(--neutral-600)] mt-1 max-w-2xl">
            Accède à l&apos;intégralité de ton écosystème de formation : milliers de kits UI8, extension VS Code dédiée et passerelle d&apos;intelligence artificielle.
          </p>
        </div>

        {/* Pilules de statut rapide */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-white px-3 py-1.5 text-xs shadow-2xs font-mono">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[color:var(--neutral-700)]">IA Privée Active</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-white px-3 py-1.5 text-xs shadow-2xs font-mono">
            <span className="text-amber-500">📦</span>
            <span className="text-[color:var(--neutral-700)]">Kits UI8 & ZIP</span>
          </div>
        </div>
      </div>

      {/* Barre de navigation par Onglets (Segmented Control Top-Tier Responsive) */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-1.5 shadow-2xs overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "templates"
              ? "bg-white text-[color:var(--neutral-black)] shadow-xs border border-[color:var(--border)]"
              : "text-[color:var(--neutral-600)] hover:text-[color:var(--neutral-black)] hover:bg-white/50"
          }`}
        >
          <span>📦</span>
          <span>Templates<span className="hidden sm:inline"> & Kits UI8</span></span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("devtools")}
          className={`flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "devtools"
              ? "bg-white text-[color:var(--neutral-black)] shadow-xs border border-[color:var(--border)]"
              : "text-[color:var(--neutral-600)] hover:text-[color:var(--neutral-black)] hover:bg-white/50"
          }`}
        >
          <span>⚡</span>
          <span>Passerelle IA<span className="hidden sm:inline"> & VS Code</span></span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("course-docs")}
          className={`flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "course-docs"
              ? "bg-white text-[color:var(--neutral-black)] shadow-xs border border-[color:var(--border)]"
              : "text-[color:var(--neutral-600)] hover:text-[color:var(--neutral-black)] hover:bg-white/50"
          }`}
        >
          <span>📚</span>
          <span>Supports<span className="hidden sm:inline"> du Formateur</span> {publishedCount > 0 ? `(${publishedCount})` : ""}</span>
        </button>
      </div>

      {/* Contenu de l'onglet actif */}
      <div>
        {/* ONGLET 1 : Templates & Kits UI8 */}
        {activeTab === "templates" && (
          <div className="animate-in fade-in zoom-in-98 duration-200">
            <DriveResourcesExplorer />
          </div>
        )}

        {/* ONGLET 2 : Environnement Développeur IA & Extension */}
        {activeTab === "devtools" && (
          <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in zoom-in-98 duration-200">
            {/* Carte 1 : Passerelle IA Forge IA */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[#171d17] p-6 text-[#fbfaf4] shadow-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)]/15 px-3 py-1 font-mono text-xs uppercase tracking-wider text-[color:var(--accent)] font-semibold">
                    <span className="size-2 rounded-full bg-[color:var(--accent)] animate-pulse" />
                    Passerelle IA Active
                  </span>
                  <span className="font-mono text-xs text-white/50">Protocole OpenAI</span>
                </div>

                <h3 className="font-display mt-4 text-2xl font-bold tracking-tight text-white">
                  Forge IA Assistant (NVIDIA NIM)
                </h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">
                  Passerelle d&apos;inférence haute vitesse propulsée par NVIDIA NIM avec DeepSeek V4 Flash & Kimi K3. Conçue pour alimenter vos extensions VS Code, agents de code autonomes et terminaux.
                </p>

                {/* Paramètres de connexion */}
                <div className="mt-6 space-y-3">
                  {/* URL API */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                        Base URL (Passerelle)
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("https://ia.guelichweb.store/v1", "url")}
                        className="text-[11px] text-[color:var(--accent)] hover:underline cursor-pointer"
                      >
                        {copiedUrl ? "✓ Copié !" : "Copier"}
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-white font-medium break-all">
                      https://ia.guelichweb.store/v1
                    </p>
                  </div>

                  {/* Clé d'API personnelle */}
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                        Ta Clé Personnelle Étudiant
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(studentApiKey, "key")}
                        className="text-[11px] text-[color:var(--accent)] hover:underline cursor-pointer"
                      >
                        {copiedKey ? "✓ Clé copiée !" : "Copier la clé"}
                      </button>
                    </div>
                    <p className="mt-1 font-mono text-xs text-[color:var(--accent)] font-medium break-all bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/5">
                      {studentApiKey}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                <span>Modèle : <strong>forgeia-coder</strong> ou <strong>deepseek-v4-flash</strong></span>
                <span className="text-emerald-400">● En ligne 24/7 (NVIDIA)</span>
              </div>
            </div>

            {/* Carte 2 : Extension VS Code Officielle */}
            <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white p-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[color:var(--accent)]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[color:var(--accent)]">
                      v1.0.0
                    </span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-medium text-primary">
                      Extension VS Code
                    </span>
                  </div>
                </div>

                <h3 className="font-display mt-4 text-2xl font-bold tracking-tight text-[color:var(--neutral-black)]">
                  FORGEIA CODE
                </h3>
                <p className="mt-2 text-xs text-[color:var(--neutral-600)] leading-relaxed">
                  L&apos;extension officielle de la formation. Elle pilote votre éditeur VS Code, exécute des commandes dans le terminal et construit vos projets pas à pas.
                </p>

                {/* Bouton de téléchargement */}
                <div className="mt-4">
                  <a
                    href="/downloads/forgeia-code-1.0.0.vsix"
                    download="forgeia-code-1.0.0.vsix"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-[0.98]"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Télécharger l&apos;extension (.vsix)
                  </a>
                </div>

                {/* Guide 3 étapes ultra-clair */}
                <div className="mt-5 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4">
                  <p className="font-semibold text-xs text-[color:var(--neutral-800)] mb-2.5">
                    Installation en 3 étapes simples :
                  </p>
                  <ol className="space-y-2 text-xs text-[color:var(--neutral-600)]">
                    <li className="flex items-start gap-2">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-bold text-white">1</span>
                      <span>Télécharge le fichier <strong>.vsix</strong> ci-dessus.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-bold text-white">2</span>
                      <span>Dans VS Code, ouvre le panneau <strong>Extensions</strong> (<kbd className="rounded border bg-white px-1 text-[10px]">Ctrl+Shift+X</kbd>), clique sur <strong>⋯</strong> puis <strong>« Installer à partir d&apos;un fichier VSIX... »</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-[10px] font-bold text-white">3</span>
                      <span>Entre ta clé étudiante <strong>{studentApiKey.slice(0, 14)}...</strong> et commence à développer !</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 3 : Supports du Formateur */}
        {activeTab === "course-docs" && (
          <div className="animate-in fade-in zoom-in-98 duration-200">
            <ResourcesPanel contents={contents} />
          </div>
        )}
      </div>
    </div>
  );
}
