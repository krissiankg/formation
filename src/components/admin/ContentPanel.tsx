"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import type { ContentItem, ContentAttachment } from "@/lib/store/content";
import { PageHeader } from "@/components/espace/shared";
import { ContentKindBadge } from "@/components/admin/ContentKindBadge";
import { DriveConnectionCard } from "@/components/admin/DriveConnectionCard";
import { formatFileSize, getFileIcon } from "@/lib/format";

export function ContentPanel({ contents }: { contents: ContentItem[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<ContentItem["kind"]>("outil");
  const [publish, setPublish] = useState(true);
  const [notify, setNotify] = useState(true);
  const [attachments, setAttachments] = useState<ContentAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadName, setCurrentUploadName] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function uploadSingleFile(file: File): Promise<ContentAttachment> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (res.error) {
              reject(new Error(res.error));
            } else {
              resolve(res);
            }
          } catch {
            reject(new Error("Réponse serveur invalide"));
          }
        } else {
          try {
            const res = JSON.parse(xhr.responseText);
            reject(new Error(res.error || `Erreur HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Erreur HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Erreur réseau pendant le téléversement"));
      };

      xhr.open("POST", "/api/admin/content/upload");
      xhr.send(formData);
    });
  }

  async function handleFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploadError(null);
    setUploading(true);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setCurrentUploadName(`${file.name} (${i + 1}/${fileArray.length})`);
      setUploadProgress(0);

      try {
        const att = await uploadSingleFile(file);
        setAttachments((prev) => [...prev, att]);
      } catch (err: any) {
        setUploadError(`Erreur lors de l'envoi de ${file.name} : ${err?.message || "Échec"}`);
        break;
      }
    }

    setUploading(false);
    setUploadProgress(0);
    setCurrentUploadName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  async function createContent(e: React.FormEvent) {
    e.preventDefault();
    if (uploading) {
      setError("Attends que le téléversement des fichiers soit terminé.");
      return;
    }
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          kind,
          publish,
          notifyWhatsapp: notify,
          attachments,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      setTitle("");
      setBody("");
      setAttachments([]);
      setMessage(
        publish && notify
          ? "Contenu publié avec pièces jointes — notification WhatsApp envoyée aux inscrits payés."
          : publish
            ? "Contenu publié avec succès."
            : "Brouillon enregistré.",
      );
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, contentTitle: string) {
    if (!confirm(`Supprimer définitivement la ressource « ${contentTitle} » ?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/content?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Erreur lors de la suppression.");
        return;
      }
      router.refresh();
    } catch {
      alert("Erreur réseau lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  const published = contents.filter((c) => c.published);
  const drafts = contents.filter((c) => !c.published);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        kicker="Ressources"
        title="Publier pour les apprenants"
        description="Outils, fichiers volumineux, codes, annonces. Les apprenants les retrouvent dans Ressources et reçoivent une alerte WhatsApp si tu coches la notification."
      />

      {/* 🚀 Passerelle Google Drive pour les fichiers ZIP */}
      <DriveConnectionCard />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
          <h2 className="font-display text-xl tracking-tight">Nouveau contenu</h2>
          <form onSubmit={createContent} className="mt-5 grid gap-4">
            <Field label="Titre">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex. Package Assets UI8, Starter Next.js, Vidéo Démo..."
                className="input-field"
              />
            </Field>
            <Field label="Contenu / Description">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={4}
                placeholder="Description, instructions d'installation, notes pour les séances..."
                className="input-field resize-y"
              />
            </Field>
            <Field label="Type">
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as ContentItem["kind"])}
                className="input-field"
              >
                <option value="outil">Outil</option>
                <option value="code">Code</option>
                <option value="programme">Programme</option>
                <option value="annonce">Annonce</option>
              </select>
            </Field>

            {/* Zone de téléversement de Pièces Jointes (Multi-formats & fichiers lourds) */}
            <div>
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--neutral-500)]">
                Pièces Jointes & Fichiers (Tous formats, jusqu&apos;à 500 Mo)
              </span>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => {
                  if (!uploading) fileInputRef.current?.click();
                }}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition cursor-pointer ${
                  isDragging
                    ? "border-[color:var(--accent)] bg-[color:var(--accent)]/5"
                    : "border-[color:var(--border)] bg-white hover:border-[color:var(--accent)]/60 hover:bg-[color:var(--neutral-50)]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(e.target.files);
                    }
                  }}
                  disabled={uploading}
                />
                <div className="flex size-10 items-center justify-center rounded-full bg-[color:var(--accent)]/10 text-lg text-[color:var(--accent)] mb-2">
                  📎
                </div>
                <p className="text-xs sm:text-sm font-medium text-[color:var(--neutral-800)]">
                  {uploading
                    ? "Téléversement en cours..."
                    : "Glisse tes fichiers ici ou clique pour parcourir"}
                </p>
                <p className="mt-1 text-[11px] text-[color:var(--neutral-500)]">
                  Tous formats supportés : ZIP, RAR, PDF, MP4, MOV, APK, VSIX, Code, Documents (jusqu&apos;à 500 Mo)
                </p>
              </div>

              {/* Barre de progression pendant l'envoi */}
              {uploading && (
                <div className="mt-3 rounded-xl border border-[color:var(--border)] bg-white p-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[color:var(--neutral-800)] truncate max-w-[220px]">
                      {currentUploadName}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[color:var(--accent)]">
                      {uploadProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[color:var(--neutral-100)]">
                    <div
                      className="h-full bg-[color:var(--accent)] transition-all duration-150 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[color:var(--neutral-500)]">
                    Envoi haute vitesse vers le serveur sans limite de mémoire...
                  </p>
                </div>
              )}

              {uploadError && (
                <p className="mt-2 rounded-lg bg-[#fce8e8] px-3 py-2 text-xs text-[color:var(--error)]">
                  {uploadError}
                </p>
              )}

              {/* Liste des fichiers joints prêts à être publiés */}
              {attachments.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <p className="text-[11px] font-semibold text-[color:var(--neutral-600)]">
                    {attachments.length} fichier{attachments.length > 1 ? "s" : ""} attaché{attachments.length > 1 ? "s" : ""} :
                  </p>
                  <ul className="divide-y divide-[color:var(--border)]/60 rounded-xl border border-[color:var(--border)] bg-white overflow-hidden">
                    {attachments.map((att) => (
                      <li
                        key={att.id}
                        className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base">{getFileIcon(att.name)}</span>
                          <span className="truncate font-medium text-[color:var(--neutral-800)]">
                            {att.name}
                          </span>
                          <span className="font-mono text-[10px] text-[color:var(--neutral-500)] whitespace-nowrap">
                            ({att.formattedSize || formatFileSize(att.size)})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(att.id)}
                          className="shrink-0 text-red-500 hover:text-red-700 p-1 font-bold text-xs"
                          title="Supprimer la pièce jointe"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-4">
              <Toggle
                checked={publish}
                onChange={setPublish}
                label="Publier immédiatement"
                hint="Visible dans l'espace apprenant · Ressources"
              />
              <Toggle
                checked={notify}
                onChange={setNotify}
                label="Notifier sur WhatsApp"
                hint="Envoie un message WhatsApp avec le lien aux inscrits payés"
                disabled={!publish}
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-fit"
              disabled={loading || uploading}
            >
              {loading
                ? "Enregistrement…"
                : uploading
                  ? "Téléversement en cours…"
                  : "Publier le contenu"}
            </button>
            {message ? (
              <p className="rounded-lg bg-[#e8f5e9] px-3 py-2 text-sm text-[#2e5a36]">{message}</p>
            ) : null}
            {error ? (
              <p className="rounded-lg bg-[#fce8e8] px-3 py-2 text-sm text-[color:var(--error)]">
                {error}
              </p>
            ) : null}
          </form>
        </section>

        <section className="space-y-6">
          <ContentList
            title="Publiés"
            items={published}
            empty="Aucun contenu publié."
            onDelete={handleDelete}
            deletingId={deletingId}
          />
          {drafts.length > 0 ? (
            <ContentList
              title="Brouillons"
              items={drafts}
              empty=""
              muted
              onDelete={handleDelete}
              deletingId={deletingId}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-[color:var(--neutral-500)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex cursor-pointer gap-3 ${disabled ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 size-4 rounded border-[color:var(--border)] accent-[color:var(--accent)]"
      />
      <span>
        <span className="block text-sm font-medium text-[color:var(--neutral-black)]">{label}</span>
        <span className="block text-xs text-[color:var(--neutral-500)]">{hint}</span>
      </span>
    </label>
  );
}

function ContentList({
  title,
  items,
  empty,
  muted,
  onDelete,
  deletingId,
}: {
  title: string;
  items: ContentItem[];
  empty: string;
  muted?: boolean;
  onDelete?: (id: string, title: string) => void;
  deletingId?: string | null;
}) {
  return (
    <div
      className={`rounded-2xl border border-[color:var(--border)] p-5 sm:p-6 ${
        muted ? "bg-[color:var(--neutral-100)]" : "bg-[color:var(--neutral-50)]"
      }`}
    >
      <h2 className="font-display text-lg tracking-tight">
        {title}{" "}
        <span className="text-base font-normal text-[color:var(--neutral-500)]">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        empty ? <p className="mt-4 text-sm text-[color:var(--neutral-500)]">{empty}</p> : null
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-4 relative group/item"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ContentKindBadge kind={c.kind} />
                  <time className="text-[11px] text-[color:var(--neutral-500)]">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </time>
                </div>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(c.id, c.title)}
                    disabled={deletingId === c.id}
                    className="text-xs text-[color:var(--neutral-400)] hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                    title="Supprimer ce contenu"
                  >
                    {deletingId === c.id ? (
                      <span className="text-[10px] text-red-500 font-medium">Suppression…</span>
                    ) : (
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              <p className="mt-2 font-medium text-[color:var(--neutral-black)]">{c.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-[color:var(--neutral-600)] whitespace-pre-wrap">{c.body}</p>

              {/* Pièces jointes rattachées au contenu */}
              {c.attachments && c.attachments.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-[color:var(--border)]/70">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[color:var(--neutral-500)] mb-1.5">
                    Fichiers & Pièces jointes ({c.attachments.length}) :
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {c.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={att.name}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-white px-2.5 py-1 text-xs text-[color:var(--neutral-800)] hover:bg-[color:var(--neutral-50)] hover:border-[color:var(--accent)] transition shadow-2xs group"
                        title={`Télécharger ${att.name}`}
                      >
                        <span className="text-sm">{getFileIcon(att.name)}</span>
                        <span className="font-medium group-hover:text-[color:var(--accent)] truncate max-w-[170px]">
                          {att.name}
                        </span>
                        <span className="text-[10px] text-[color:var(--neutral-500)] font-mono">
                          ({att.formattedSize || formatFileSize(att.size)})
                        </span>
                        <span className="text-xs text-[color:var(--neutral-400)] group-hover:text-[color:var(--accent)] transition">
                          ⬇️
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

