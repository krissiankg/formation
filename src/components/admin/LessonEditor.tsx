"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LessonMarkdown } from "@/components/espace/LessonMarkdown";
import { uploadFile } from "@/lib/client/upload-file";
import { LESSON_TYPES, LESSON_TYPE_LABELS } from "@/lib/programme/lesson-types";
import type { FormationLesson, FormationModule } from "@/lib/programme/types";

type Draft = Pick<FormationLesson, "title" | "type" | "duration" | "moduleId" | "body">;

// Actions de la barre d'outils : texte inséré autour de la sélection (ou à sa place).
const TOOLS: { label: string; title: string; before: string; after?: string; placeholder: string; block?: boolean }[] = [
  { label: "G", title: "Gras", before: "**", after: "**", placeholder: "texte en gras" },
  { label: "I", title: "Italique", before: "*", after: "*", placeholder: "texte en italique" },
  { label: "H2", title: "Titre de section", before: "## ", placeholder: "Titre de section", block: true },
  { label: "H3", title: "Sous-titre", before: "### ", placeholder: "Sous-titre", block: true },
  { label: "• Liste", title: "Liste à puces", before: "- ", placeholder: "élément", block: true },
  { label: "1. Liste", title: "Liste numérotée", before: "1. ", placeholder: "étape", block: true },
  { label: "☐ Tâche", title: "Case à cocher", before: "- [ ] ", placeholder: "tâche à faire", block: true },
  { label: "❝ Encadré", title: "Encadré / astuce", before: "> 💡 ", placeholder: "Astuce", block: true },
  { label: "</> Code", title: "Bloc de code", before: "```\n", after: "\n```", placeholder: "code ou consigne à copier", block: true },
  { label: "`x`", title: "Code en ligne", before: "`", after: "`", placeholder: "commande" },
  { label: "Lien", title: "Lien", before: "[", after: "](https://)", placeholder: "texte du lien" },
  {
    label: "Tableau",
    title: "Tableau",
    before: "| Colonne 1 | Colonne 2 |\n|---|---|\n| ",
    after: " | |",
    placeholder: "valeur",
    block: true,
  },
];

export function LessonEditor({ lesson, modules }: { lesson: FormationLesson; modules: FormationModule[] }) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>({
    title: lesson.title,
    type: lesson.type,
    duration: lesson.duration,
    moduleId: lesson.moduleId,
    body: lesson.body,
  });
  const [saved, setSaved] = useState<Draft>(draft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [mobileTab, setMobileTab] = useState<"write" | "preview">("write");

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const save = useCallback(async () => {
    if (!draft.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/programme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateLesson", id: lesson.id, ...draft }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Enregistrement impossible.");
        return;
      }
      setSaved(draft);
      setMessage("Enregistré — les apprenants voient déjà la nouvelle version.");
      router.refresh();
    } catch {
      setError("Erreur réseau. Ton texte n'est pas perdu : réessaie.");
    } finally {
      setSaving(false);
    }
  }, [draft, lesson.id, router]);

  // Ctrl+S / Cmd+S pour enregistrer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (!saving) void save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, saving]);

  // Avertit avant de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function insert(before: string, after = "", placeholder = "", block = false) {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end, value } = el;
    const selected = value.slice(start, end) || placeholder;
    // En mode « bloc », on démarre sur une nouvelle ligne
    const prefix = block && start > 0 && value[start - 1] !== "\n" ? "\n" : "";
    const inserted = `${prefix}${before}${selected}${after}`;
    const next = value.slice(0, start) + inserted + value.slice(end);
    setDraft((d) => ({ ...d, body: next }));
    requestAnimationFrame(() => {
      el.focus();
      const selStart = start + prefix.length + before.length;
      el.setSelectionRange(selStart, selStart + selected.length);
    });
  }

  async function onImageSelected(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choisis un fichier image (PNG, JPG, WebP, GIF…).");
      return;
    }
    setError(null);
    setUploadProgress(0);
    try {
      const att = await uploadFile(file, setUploadProgress);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      insert(`![${alt}](${att.url})`, "", "", true);
      setMessage("Image insérée — pense à enregistrer.");
    } catch (err) {
      setError(`Envoi de l'image impossible : ${(err as Error).message}`);
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const sortedModules = [...modules].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/programme" className="text-sm accent-text hover:underline">
          ← Programme
        </Link>
        <div className="flex items-center gap-3">
          <span className={`text-xs ${dirty ? "text-[color:var(--accent-dark)]" : "text-[color:var(--neutral-500)]"}`}>
            {dirty ? "● Modifications non enregistrées" : "✓ À jour"}
          </span>
          <button type="button" className="btn-primary !py-2 text-sm" disabled={saving || !dirty} onClick={() => void save()}>
            {saving ? "Enregistrement…" : "Enregistrer (Ctrl+S)"}
          </button>
        </div>
      </div>

      {/* Métadonnées */}
      <div className="grid gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.4fr]">
        <label className="grid gap-1 text-xs text-[color:var(--neutral-500)]">
          Titre
          <input
            className="input-field"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-xs text-[color:var(--neutral-500)]">
          Type
          <select
            className="input-field"
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as FormationLesson["type"] }))}
          >
            {LESSON_TYPES.map((t) => (
              <option key={t} value={t}>
                {LESSON_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-[color:var(--neutral-500)]">
          Durée
          <input
            className="input-field"
            value={draft.duration}
            onChange={(e) => setDraft((d) => ({ ...d, duration: e.target.value }))}
          />
        </label>
        <label className="grid gap-1 text-xs text-[color:var(--neutral-500)]">
          Module
          <select
            className="input-field"
            value={draft.moduleId}
            onChange={(e) => setDraft((d) => ({ ...d, moduleId: e.target.value }))}
          >
            {sortedModules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.monthLabel} — {m.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {message ? <p className="rounded-lg bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e5a36]">{message}</p> : null}
      {error ? <p className="rounded-lg bg-[#fce8e8] px-3 py-2 text-sm text-[color:var(--error)]">{error}</p> : null}

      {/* Onglets sur mobile */}
      <div className="flex gap-2 lg:hidden">
        {(["write", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              mobileTab === tab
                ? "bg-[color:var(--neutral-black)] text-[color:var(--neutral-50)]"
                : "border border-[color:var(--border)]"
            }`}
          >
            {tab === "write" ? "Écrire" : "Aperçu apprenant"}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Éditeur */}
        <section className={`${mobileTab === "write" ? "" : "hidden"} lg:block`}>
          <div className="sticky top-0 z-10 flex flex-wrap gap-1.5 rounded-t-2xl border border-b-0 border-[color:var(--border)] bg-[color:var(--neutral-100)] p-2">
            {TOOLS.map((tool) => (
              <button
                key={tool.title}
                type="button"
                title={tool.title}
                onClick={() => insert(tool.before, tool.after, tool.placeholder, tool.block)}
                className="rounded-md border border-[color:var(--border)] bg-[color:var(--neutral-50)] px-2.5 py-1 text-xs font-medium hover:border-[color:var(--accent)]"
              >
                {tool.label}
              </button>
            ))}
            <button
              type="button"
              title="Insérer une image"
              disabled={uploadProgress !== null}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-[color:var(--accent)] bg-[color:var(--accent-lightest)] px-2.5 py-1 text-xs font-semibold text-[color:var(--accent-darkest)]"
            >
              {uploadProgress !== null ? `Envoi… ${uploadProgress}%` : "🖼 Insérer une image"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void onImageSelected(e.target.files?.[0])}
            />
          </div>
          <textarea
            ref={textareaRef}
            value={draft.body}
            onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
            spellCheck
            className="block min-h-[70vh] w-full resize-y rounded-b-2xl border border-[color:var(--border)] bg-white p-4 font-mono text-[13px] leading-relaxed outline-none focus:border-[color:var(--accent)]"
            placeholder="Écris le contenu de la leçon ici. Utilise la barre d'outils pour les titres, listes, tableaux, code et images."
          />
        </section>

        {/* Aperçu */}
        <section className={`${mobileTab === "preview" ? "" : "hidden"} lg:block`}>
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-8 lg:max-h-[calc(70vh+44px)] lg:overflow-y-auto">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--accent-dark)]">
              Aperçu apprenant · {LESSON_TYPE_LABELS[draft.type]} · {draft.duration}
            </p>
            <h1 className="font-display mt-2 text-2xl tracking-tight">{draft.title || "Sans titre"}</h1>
            <div className="mt-6">
              {draft.body.trim() ? (
                <LessonMarkdown source={draft.body} />
              ) : (
                <p className="text-sm text-[color:var(--neutral-500)]">L&apos;aperçu apparaîtra ici.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
