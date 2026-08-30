"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContentItem } from "@/lib/store/content";
import { PageHeader } from "@/components/espace/shared";
import { ContentKindBadge } from "@/components/admin/ContentKindBadge";

export function ContentPanel({ contents }: { contents: ContentItem[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<ContentItem["kind"]>("outil");
  const [publish, setPublish] = useState(true);
  const [notify, setNotify] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createContent(e: React.FormEvent) {
    e.preventDefault();
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
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      setTitle("");
      setBody("");
      setMessage(
        publish && notify
          ? "Contenu publié — notification WhatsApp envoyée aux inscrits payés."
          : publish
            ? "Contenu publié."
            : "Brouillon enregistré.",
      );
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  const published = contents.filter((c) => c.published);
  const drafts = contents.filter((c) => !c.published);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        kicker="Ressources"
        title="Publier pour les apprenants"
        description="Outils, codes, annonces. Les apprenants les voient dans Ressources et reçoivent une alerte WhatsApp si tu coches la notification."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-5 sm:p-6">
          <h2 className="font-display text-xl tracking-tight">Nouveau contenu</h2>
          <form onSubmit={createContent} className="mt-5 grid gap-4">
            <Field label="Titre">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex. Prompt SaaS #1, Lien Figma, Starter Next.js…"
                className="input-field"
              />
            </Field>
            <Field label="Contenu">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={5}
                placeholder="Description, lien, extrait de code, consignes pour la séance…"
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
                hint="Envoie un message à chaque inscrit ayant payé"
                disabled={!publish}
              />
            </div>
            <button type="submit" className="btn-primary w-fit" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
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
          <ContentList title="Publiés" items={published} empty="Aucun contenu publié." />
          {drafts.length > 0 ? (
            <ContentList title="Brouillons" items={drafts} empty="" muted />
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
}: {
  title: string;
  items: ContentItem[];
  empty: string;
  muted?: boolean;
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
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <ContentKindBadge kind={c.kind} />
                <time className="text-[11px] text-[color:var(--neutral-500)]">
                  {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </time>
              </div>
              <p className="mt-2 font-medium text-[color:var(--neutral-black)]">{c.title}</p>
              <p className="mt-1 line-clamp-3 text-sm text-[color:var(--neutral-600)]">{c.body}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
