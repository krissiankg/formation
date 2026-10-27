"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WalletWidget } from "@/components/espace/WalletWidget";
import { UnlockConfirmModal } from "@/components/espace/UnlockConfirmModal";
import type { CoinPack, CoinTransaction } from "@/lib/wallet/types";
import { COIN_PACKS } from "@/lib/wallet/types";
import type { DriveResourceKind } from "@/lib/drive/resource-kind";

interface DriveResourceFile {
  id: string;
  name: string;
  size?: number;
  formattedSize: string;
  modifiedTime?: string;
  isZip: boolean;
  coinsCost: number;
}

const collectionCopy = {
  "design-code": {
    title: "Kits UI & code",
    description: "Maquettes UI8, composants et projets pour concevoir tes interfaces et les adapter avec l’IA.",
    placeholder: "Rechercher un kit : dashboard, Figma, SaaS…",
    tags: ["SaaS", "Dashboard", "Mobile", "Figma", "Ecommerce", "Icons"],
  },
  wordpress: {
    title: "Templates WordPress",
    description: "Thèmes, packs Elementor et ressources pour créer ou personnaliser ton site WordPress.",
    placeholder: "Rechercher un thème : restaurant, portfolio, business…",
    tags: ["WordPress", "Elementor", "WooCommerce", "Business", "Portfolio", "Blog"],
  },
  all: {
    title: "Toutes les archives Drive",
    description: "Retrouve les fichiers de tous les dossiers partagés de la formation, quel que soit leur type.",
    placeholder: "Rechercher dans toutes les archives…",
    tags: ["SaaS", "Dashboard", "Figma", "WordPress", "Elementor", "Portfolio"],
  },
};

export function DriveResourcesExplorer({ kind = "all", onBrowseAll }: { kind?: DriveResourceKind; onBrowseAll?: () => void }) {
  const [files, setFiles] = useState<DriveResourceFile[]>([]);
  const [searching, setSearching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyZip, setOnlyZip] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unlockedFileIds, setUnlockedFileIds] = useState<string[]>([]);
  const [packs, setPacks] = useState<CoinPack[]>(COIN_PACKS);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [unlockTarget, setUnlockTarget] = useState<DriveResourceFile | null>(null);
  const copy = collectionCopy[kind];
  const query = search.trim();
  const hasQuery = query.length >= 2;

  const loadWallet = useCallback(async () => {
    try {
      const response = await fetch("/api/wallet");
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance ?? 0);
        setIsAdmin(Boolean(data.isAdmin));
        setUnlockedFileIds(data.unlockedFileIds ?? []);
        if (data.packs) setPacks(data.packs);
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("[Wallet Fetch Error]", err);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadWallet(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadWallet]);

  useEffect(() => {
    if (query.length === 1) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      setError(null);
      setNotice(null);
      const params = new URLSearchParams({ kind, q: query });
      try {
        while (!controller.signal.aborted) {
          const response = await fetch("/api/ressources/drive?" + params, { signal: controller.signal, cache: "no-store" });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Impossible de charger les ressources.");
          if (controller.signal.aborted) return;
          setConfigured(data.configured !== false);
          setFiles(data.files || []);
          setNotice(data.isIndexing
            ? "Recherche dans les sous-dossiers en cours…"
            : data.warning ? "Un dossier est temporairement indisponible. Les autres ressources restent accessibles." : null);
          if (!data.isIndexing || data.configured === false) break;
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Erreur réseau.");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, query ? 350 : 0);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [kind, query, attempt]);

  function updateSearch(value: string) {
    setSearch(value);
    setSearching(value.trim().length !== 1);
    setNotice(null);
  }

  const displayedFiles = useMemo(() => onlyZip ? files.filter((file) => file.isZip) : files, [files, onlyZip]);

  return (
    <section className="space-y-5" aria-label={copy.title}>
      <div className="rounded-2xl border border-[color:var(--border)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">{copy.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--neutral-600)]">{copy.description}</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">Déblocage en coins</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[color:var(--neutral-600)]">Consulte le coût de chaque archive avant de la débloquer. Les fichiers déjà débloqués restent téléchargeables sans nouveau débit.</p>
        {kind !== "all" && onBrowseAll && <p className="mt-2 text-xs leading-relaxed text-[color:var(--neutral-600)]">
          Le classement repose sur le nom des archives. Un fichier manque ? <button type="button" onClick={onBrowseAll} className="font-semibold text-[color:var(--accent)] underline underline-offset-2">Voir toutes les archives Drive</button>
        </p>}
      </div>

      <WalletWidget balance={walletBalance} isAdmin={isAdmin} packs={packs} transactions={transactions} onRefresh={loadWallet} />

      <div className="space-y-3">
        <label className="block">
          <span className="sr-only">Rechercher dans {copy.title}</span>
          <input type="search" value={search} onChange={(event) => updateSearch(event.target.value)} placeholder={copy.placeholder}
            className="w-full rounded-xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm focus:outline-2 focus:outline-[color:var(--accent)]" />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-[color:var(--neutral-600)]">Suggestions :</span>
          {copy.tags.map((tag) => <button key={tag} type="button" aria-pressed={query.toLowerCase() === tag.toLowerCase()}
            onClick={() => updateSearch(query.toLowerCase() === tag.toLowerCase() ? "" : tag)}
            className={"rounded-full border px-3 py-1.5 text-xs transition-colors " + (query.toLowerCase() === tag.toLowerCase() ? "border-[color:var(--neutral-black)] bg-[color:var(--neutral-black)] text-white" : "border-[color:var(--border)] bg-white hover:border-[color:var(--accent)]")}>{tag}</button>)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[color:var(--neutral-600)]" role="status">
          {query.length === 1 ? "Saisis au moins deux caractères pour rechercher." : searching ? "Chargement des ressources…" : hasQuery
            ? displayedFiles.length + (files.length >= 60 ? " premiers résultats · affine ta recherche pour voir les autres." : " résultat(s)")
            : displayedFiles.length + " ressources récentes · recherche pour en trouver d’autres."}
        </p>
        <label className="flex items-center gap-2 text-xs text-[color:var(--neutral-600)]">
          <input type="checkbox" checked={onlyZip} onChange={(event) => setOnlyZip(event.target.checked)} className="accent-[color:var(--accent)]" />
          Archives uniquement
        </label>
      </div>

      {notice && <p className="text-xs text-[color:var(--neutral-600)]" role="status">{notice}</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error} <button type="button" onClick={() => setAttempt(attempt + 1)} className="ml-2 font-semibold underline">Réessayer</button>
      </div>}

      {!configured ? <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-8 text-center text-sm">Ces ressources sont en attente de connexion par le formateur.</div>
        : searching && !files.length ? <div className="columns-1 gap-4 sm:columns-2 lg:columns-4" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="mb-4 break-inside-avoid rounded-2xl border border-[color:var(--border)] bg-white p-5 motion-safe:animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-stone-100" /><div className="mt-4 h-4 w-3/4 rounded bg-stone-100" /><div className="mt-3 h-3 w-1/2 rounded bg-stone-100" /><div className="mt-6 h-9 rounded-lg bg-stone-100" />
          </div>)}
        </div>
        : !error && !displayedFiles.length ? <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-white p-8 text-center">
          <h3 className="text-sm font-semibold">{hasQuery ? "Aucune archive ne correspond à cette recherche." : "Aucune archive trouvée dans cette catégorie."}</h3>
          <p className="mt-2 text-xs text-[color:var(--neutral-600)]">Essaie un autre mot-clé ou consulte toutes les archives Drive.</p>
          {kind !== "all" && onBrowseAll && <button type="button" onClick={onBrowseAll} className="mt-4 text-xs font-semibold text-[color:var(--accent)] underline">Toutes les archives Drive</button>}
        </div>
        : <div className="columns-1 gap-4 sm:columns-2 lg:columns-4" data-resource-masonry>
          {displayedFiles.map((file) => {
            const unlocked = isAdmin || unlockedFileIds.includes(file.id);
            return <article key={file.id} className="mb-4 inline-block w-full break-inside-avoid rounded-2xl border border-[color:var(--border)] bg-white p-4 align-top shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span aria-hidden="true" className={"inline-flex size-10 items-center justify-center rounded-xl font-mono text-xs font-bold " + (kind === "wordpress" ? "bg-sky-50 text-sky-800" : "bg-violet-50 text-violet-800")}>{kind === "wordpress" ? "WP" : file.isZip ? "ZIP" : "FILE"}</span>
                {unlocked && <span className="text-[10px] font-semibold text-emerald-800">✓ Débloqué</span>}
              </div>
              <h3 className="mt-3 break-words text-sm font-semibold leading-relaxed">{file.name}</h3>
              <p className="mt-2 text-xs text-[color:var(--neutral-600)]">{file.formattedSize}{file.modifiedTime ? " · " + new Date(file.modifiedTime).toLocaleDateString("fr-FR") : ""}</p>
              <div className="mt-4 border-t border-[color:var(--border)] pt-3">
                {unlocked ? <a href={"/api/ressources/drive/download/" + file.id} download={file.name} className="block rounded-lg bg-[color:var(--neutral-black)] px-3 py-2.5 text-center text-xs font-semibold text-white">Télécharger</a>
                  : <button type="button" onClick={() => setUnlockTarget(file)} className="w-full rounded-lg bg-[color:var(--neutral-black)] px-3 py-2.5 text-xs font-semibold text-white">Débloquer · {file.coinsCost} coins</button>}
              </div>
            </article>;
          })}
        </div>}

      <UnlockConfirmModal key={unlockTarget?.id || "closed"} file={unlockTarget} balance={walletBalance} onClose={() => setUnlockTarget(null)}
        onSuccess={(balance, id) => { setWalletBalance(balance); setUnlockedFileIds((ids) => [...ids, id]); void loadWallet(); }}
        onOpenRecharge={() => { setUnlockTarget(null); window.dispatchEvent(new CustomEvent("open-coins-tab")); }} />
    </section>
  );
}
