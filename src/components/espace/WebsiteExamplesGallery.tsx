"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicExample } from "@/lib/website-examples/types";

type Catalog = { entries: PublicExample[]; sites: number; total: number };
const categories = [{ id: "sites", label: "Sites complets" }, { id: "pages", label: "Pages des sites" }, { id: "components", label: "Autres exemples" }, { id: "all", label: "Tout voir" }];
const pageSize = 24;
const thumbnailShapes = ["aspect-[4/3]", "aspect-video", "aspect-[3/2]", "aspect-[16/10]", "aspect-[4/3]"];

export function WebsiteExamplesGallery() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("sites");
  const [collection, setCollection] = useState("all");
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ressources/exemples", { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Impossible de charger les exemples.");
        setCatalog(body);
      }).catch((e) => { if (e.name !== "AbortError") setError(e.message); });
    return () => controller.abort();
  }, [attempt]);

  const entries = useMemo(() => {
    const words = query.trim().toLocaleLowerCase("fr").split(/\s+/);
    return (catalog?.entries || []).filter((entry) => (category === "all" || entry.category === category)
      && (collection === "all" || entry.collection === collection)
      && words.every((word) => `${entry.title} ${entry.family}`.toLocaleLowerCase("fr").includes(word)));
  }, [catalog, category, collection, query]);
  const collections = [...new Set((catalog?.entries || []).map((entry) => entry.collection))].sort();
  const collectionLabel = (id: string) => /^forgeia-\d+$/.test(id) ? `Collection ${id.split("-").at(-1)}` : "Collection FORGEIA";
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  async function download(entry: PublicExample) {
    setDownloading(entry.id);
    setError("");
    try {
      const response = await fetch(`/api/ressources/exemples/${entry.id}/download`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Le téléchargement a échoué.");
      window.location.assign(body.url);
    } catch (e) { setError(e instanceof Error ? e.message : "Le téléchargement a échoué."); }
    finally { setDownloading(null); }
  }

  return <section className="space-y-5" aria-label="Sites HTML">
    <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold">Sites HTML à personnaliser</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">Gratuit provisoirement</span>
      </div>
      <p className="mt-2 text-sm text-[color:var(--neutral-600)]">{catalog ? `${catalog.sites} sites complets · ${catalog.total} pages et exemples. ` : "Bibliothèque de sites HTML, CSS et JavaScript. "}Ouvre un aperçu dans un nouvel onglet ou télécharge ses sources en ZIP.</p>
      <p className="mt-3 text-xs leading-relaxed text-[color:var(--neutral-600)]">Les aperçus présentent les modèles FORGEIA fournis. Les visuels et vidéos absents restent à personnaliser. Les formulaires, paiements et autres services présentés dans les démos sont des exemples à configurer.</p>
    </div>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex-1">
        <span className="sr-only">Rechercher un exemple</span>
        <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Rechercher : restaurant, portfolio, agency…" className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm" />
      </label>
      {collections.length > 1 && <label>
        <span className="sr-only">Collection de modèles</span>
        <select value={collection} onChange={(e) => { setCollection(e.target.value); setPage(1); }} className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm">
          <option value="all">Toutes les collections</option>
          {collections.map((id) => <option key={id} value={id}>{collectionLabel(id)}</option>)}
        </select>
      </label>}
      <label>
        <span className="sr-only">Type d’exemple</span>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm">
          {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
    </div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} {!catalog && <button type="button" className="ml-3 underline" onClick={() => { setError(""); setAttempt(attempt + 1); }}>Réessayer</button>}</div>}
    {!catalog && !error && <p role="status" className="py-12 text-center text-sm">Chargement des exemples…</p>}
    {catalog && <>
      <p className="text-xs text-[color:var(--neutral-600)]" aria-live="polite">{entries.length} exemple{entries.length > 1 ? "s" : ""} · Page {currentPage} / {totalPages}</p>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-4" data-resource-masonry>
        {entries.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((entry, index) => <article key={entry.id} className="mb-4 inline-block w-full break-inside-avoid overflow-hidden rounded-2xl border border-[color:var(--border)] bg-white align-top shadow-sm">
          <a href={entry.previewUrl} target="_blank" rel="noopener noreferrer" aria-label={`Voir ${entry.title} dans un nouvel onglet`} className={`relative block overflow-hidden bg-stone-100 ${thumbnailShapes[index % thumbnailShapes.length]}`}>
            {/* Screenshots are served directly from the isolated demo CDN. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={entry.thumbnailUrl} alt={`Aperçu de ${entry.title}`} width={640} height={480} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 motion-reduce:transition-none hover:scale-[1.03]" />
          </a>
          <div className="p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--neutral-600)]">{collections.length > 1 ? `${collectionLabel(entry.collection)} · ` : ""}{entry.category === "sites" ? "Site complet" : entry.category === "pages" ? "Page du site" : "Exemple HTML"} · {entry.pageCount} page{entry.pageCount > 1 ? "s" : ""} dans le ZIP</p>
            <h3 className="mt-2 break-words font-display text-sm font-bold capitalize">{entry.title}</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={entry.previewUrl} target="_blank" rel="noopener noreferrer" className="min-w-20 flex-1 rounded-lg border border-[color:var(--border)] px-2 py-2.5 text-center text-xs font-semibold hover:bg-stone-50">Voir le site ↗</a>
              <button type="button" disabled={downloading !== null} onClick={() => download(entry)} className="min-w-24 flex-1 rounded-lg bg-[color:var(--neutral-black)] px-2 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{downloading === entry.id ? "Préparation…" : "Télécharger ZIP"}</button>
            </div>
            <p className="mt-2 text-right text-[10px] text-[color:var(--neutral-600)]">Sources · {(entry.archiveBytes / 1024 / 1024).toLocaleString("fr", { maximumFractionDigits: 1 })} Mo</p>
          </div>
        </article>)}
      </div>
      {!entries.length && <p className="py-10 text-center text-sm">Aucun exemple ne correspond à cette recherche.</p>}
      {totalPages > 1 && <nav aria-label="Pagination des exemples" className="flex items-center justify-center gap-4 pt-4">
        <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm disabled:opacity-40">Précédent</button>
        <span className="text-sm">{currentPage} / {totalPages}</span>
        <button type="button" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-[color:var(--border)] px-4 py-2 text-sm disabled:opacity-40">Suivant</button>
      </nav>}
    </>}
  </section>;
}
