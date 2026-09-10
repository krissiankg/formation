"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { WalletWidget } from "@/components/espace/WalletWidget";
import { UnlockConfirmModal } from "@/components/espace/UnlockConfirmModal";
import type { CoinPack, CoinTransaction } from "@/lib/wallet/types";
import { COIN_PACKS } from "@/lib/wallet/types";

interface DriveResourceFile {
  id: string;
  name: string;
  size?: number;
  formattedSize: string;
  modifiedTime?: string;
  isZip: boolean;
  coinsCost: number;
}

const QUICK_TAGS = [
  { label: "SaaS", value: "saas" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Mobile App", value: "mobile app" },
  { label: "Figma UI", value: "figma" },
  { label: "E-Commerce", value: "ecommerce" },
  { label: "3D & Icons", value: "icon" },
];

export function DriveResourcesExplorer() {
  const [files, setFiles] = useState<DriveResourceFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState(true);
  const [search, setSearch] = useState("");
  const [onlyZip, setOnlyZip] = useState(true);

  // État du portefeuille
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [unlockedFileIds, setUnlockedFileIds] = useState<string[]>([]);
  const [packs, setPacks] = useState<CoinPack[]>(COIN_PACKS);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);

  // Modales
  const [unlockTarget, setUnlockTarget] = useState<DriveResourceFile | null>(null);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Charger le solde et les fichiers débloqués
  async function loadWallet() {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance ?? 0);
        setIsAdmin(Boolean(data.isAdmin));
        setUnlockedFileIds(data.unlockedFileIds ?? []);
        if (data.packs) setPacks(data.packs);
        if (data.transactions) setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("[Wallet Fetch Error]", err);
    }
  }

  useEffect(() => {
    loadWallet();
  }, []);

  async function fetchFiles(query: string) {
    const trimmed = query.trim();

    // S'il n'y a pas de mot clé de recherche, on ne renvoie et n'affiche aucun fichier
    if (!trimmed || trimmed.length < 2) {
      setFiles([]);
      setSearching(false);
      setLoading(false);
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const url = `/api/ressources/drive?q=${encodeURIComponent(trimmed)}`;

      const res = await fetch(url);
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
      setSearching(false);
    }
  }

  // Détection de la saisie utilisateur avec debounce (350ms)
  function handleSearchChange(val: string) {
    setSearch(val);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!val.trim() || val.trim().length < 2) {
      setFiles([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchFiles(val);
    }, 350);
  }

  // Clic sur une suggestion : sélectionne ou DÉSÉLECTIONNE si déjà actif
  function handleTagClick(tagValue: string) {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (search.toLowerCase() === tagValue.toLowerCase()) {
      // Désélectionner
      setSearch("");
      setFiles([]);
      setSearching(false);
    } else {
      // Sélectionner
      setSearch(tagValue);
      fetchFiles(tagValue);
    }
  }

  const displayedFiles = useMemo(() => {
    if (!onlyZip) return files;
    return files.filter((f) => f.isZip);
  }, [files, onlyZip]);

  const zipCount = useMemo(() => files.filter((f) => f.isZip).length, [files]);
  const hasQuery = search.trim().length >= 2;

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-4 text-[color:var(--neutral-black)] sm:p-8 shadow-sm">
      {/* Widget Portefeuille Coins en haut */}
      <div className="mb-6">
        <WalletWidget
          balance={walletBalance}
          isAdmin={isAdmin}
          packs={packs}
          transactions={transactions}
          onRefresh={loadWallet}
          openRechargeModal={rechargeModalOpen}
          onCloseRechargeModal={() => setRechargeModalOpen(false)}
        />
      </div>

      {/* En-tête avec Collection UI8 */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--neutral-100)] px-3 py-1 font-mono text-xs font-semibold text-[color:var(--neutral-700)]">
              <span className="size-1.5 rounded-full bg-[color:var(--accent)]" />
              Collection UI8
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Projets & Ressources ZIP
          </h2>
          <p className="max-w-2xl text-sm text-[color:var(--neutral-600)]">
            Recherche parmi l&apos;intégralité des milliers de templates, kits UI et archives du dossier partagé de la formation. Débloque-les avec tes coins et conserve-les à vie.
          </p>
        </div>

        {/* Badge récapitulatif */}
        {hasQuery && !searching && (
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] px-4 py-2 text-right">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--neutral-500)]">
              Résultats trouvés
            </p>
            <p className="font-mono text-lg font-bold text-[color:var(--accent-darkest)]">
              {displayedFiles.length} {displayedFiles.length > 1 ? "fichiers" : "fichier"}
            </p>
          </div>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="mt-6 space-y-3">
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[color:var(--neutral-400)]">
            {searching ? (
              <svg className="size-4 animate-spin text-[color:var(--accent)]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher par nom (ex: saas, dashboard, finance, mobile, e-commerce...)"
            className="w-full rounded-xl border border-[color:var(--border)] bg-white py-3 pl-10 pr-10 text-sm placeholder:text-[color:var(--neutral-400)] focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/20 shadow-xs"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-sm text-[color:var(--neutral-400)] hover:text-[color:var(--neutral-700)] cursor-pointer"
              title="Effacer la recherche"
            >
              ✕
            </button>
          )}
        </div>

        {/* Suggestions de tags (sélectionnables et désélectionnables en un clic) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[color:var(--neutral-500)] mr-1">
            Suggestions :
          </span>
          {QUICK_TAGS.map((tag) => {
            const isSelected = search.toLowerCase() === tag.value.toLowerCase();
            return (
              <button
                key={tag.label}
                type="button"
                onClick={() => handleTagClick(tag.value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-[color:var(--accent)] text-white shadow-xs"
                    : "bg-white border border-[color:var(--border)] text-[color:var(--neutral-600)] hover:border-[color:var(--accent)] hover:text-[color:var(--neutral-black)]"
                }`}
              >
                {isSelected ? `✓ ${tag.label}` : tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Barre de filtres format */}
      {hasQuery && displayedFiles.length > 0 && (
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[color:var(--border)] pt-4">
          <p className="text-xs text-[color:var(--neutral-500)]">
            {searching ? "Recherche en cours dans Google Drive..." : `${displayedFiles.length} ressource(s) trouvée(s)`}
          </p>

          <div className="flex items-center gap-1.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-100)] p-1 text-xs w-fit">
            <button
              onClick={() => setOnlyZip(true)}
              className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                onlyZip
                  ? "bg-white text-[color:var(--neutral-black)] shadow-xs"
                  : "text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-black)]"
              }`}
            >
              Archives .ZIP ({zipCount})
            </button>
            <button
              onClick={() => setOnlyZip(false)}
              className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer ${
                !onlyZip
                  ? "bg-white text-[color:var(--neutral-black)] shadow-xs"
                  : "text-[color:var(--neutral-500)] hover:text-[color:var(--neutral-black)]"
              }`}
            >
              Tous les formats ({files.length})
            </button>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <div className="mt-5">
        {searching && files.length === 0 ? (
          /* Skeletons pendant la recherche */
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-[color:var(--border)] bg-white p-4">
                <div className="h-4 w-3/4 rounded bg-[color:var(--neutral-200)]" />
                <div className="mt-3 flex items-center justify-between">
                  <div className="h-3 w-20 rounded bg-[color:var(--neutral-100)]" />
                  <div className="h-8 w-24 rounded bg-[color:var(--neutral-200)]" />
                </div>
              </div>
            ))}
          </div>
        ) : !configured ? (
          /* Non encore connecté */
          <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--neutral-100)] p-8 text-center">
            <h3 className="font-medium text-[color:var(--neutral-black)]">
              Dossier en attente de synchronisation
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-[color:var(--neutral-500)]">
              Le dossier partagé est en cours d&apos;autorisation par le formateur.
            </p>
          </div>
        ) : error ? (
          /* Erreur */
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Erreur de chargement</p>
            <p className="mt-1 text-xs">{error}</p>
          </div>
        ) : !hasQuery ? (
          /* État initial : Aucun terme de recherche saisi -> aucun fichier affiché */
          <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-white p-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[color:var(--neutral-100)] text-[color:var(--neutral-500)]">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[color:var(--neutral-800)]">
              Rechercher une ressource ou un template
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[color:var(--neutral-500)]">
              Tape le nom d&apos;un projet ou clique sur l&apos;une des suggestions ci-dessus pour afficher les fichiers disponibles au téléchargement.
            </p>
          </div>
        ) : displayedFiles.length === 0 ? (
          /* Recherche sans résultat */
          <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-white p-8 text-center">
            <p className="text-sm font-semibold text-[color:var(--neutral-700)]">
              Aucun fichier trouvé pour &laquo; {search} &raquo;
            </p>
            <p className="mt-1 text-xs text-[color:var(--neutral-500)]">
              Essaie avec un mot-clé différent (ex: <code>saas</code>, <code>dashboard</code>, <code>finance</code>, <code>mobile</code>).
            </p>
            <button
              onClick={() => handleSearchChange("")}
              className="mt-3 inline-flex items-center rounded-lg bg-[color:var(--neutral-100)] px-3 py-1.5 text-xs font-medium text-[color:var(--neutral-700)] hover:bg-[color:var(--neutral-200)] cursor-pointer"
            >
              Effacer la recherche
            </button>
          </div>
        ) : (
          /* Liste des fichiers trouvés */
          <div className="grid gap-3 sm:grid-cols-2">
            {displayedFiles.map((file) => {
              const formattedDate = file.modifiedTime
                ? new Date(file.modifiedTime).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : null;

              const isUnlocked = isAdmin || unlockedFileIds.includes(file.id);

              return (
                <div
                  key={file.id}
                  className={`flex flex-col justify-between rounded-xl border p-4 shadow-2xs transition ${
                    isUnlocked
                      ? "border-emerald-200 bg-emerald-50/20 hover:border-emerald-400"
                      : "border-[color:var(--border)] bg-white hover:border-amber-400 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icône */}
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        isUnlocked
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isUnlocked ? (
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.75}
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
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
                        <span className="font-mono font-medium text-[color:var(--neutral-700)]">
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

                  {/* Pied de carte : Coût / Statut & Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-[color:var(--border)]/60 pt-3">
                    {/* Badge Statut / Prix */}
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        <span>✓</span> Débloqué à vie
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900">
                        <span>🪙</span> {file.coinsCost} Coins
                      </span>
                    )}

                    {/* Bouton Télécharger ou Débloquer */}
                    {isUnlocked ? (
                      <a
                        href={`/api/ressources/drive/download/${file.id}`}
                        download={file.name}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
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
                    ) : (
                      <button
                        type="button"
                        onClick={() => setUnlockTarget(file)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-600 active:scale-95 cursor-pointer"
                      >
                        <span>🪙</span>
                        <span>Débloquer ({file.coinsCost} coins)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Note d'information */}
      <div className="mt-6 border-t border-[color:var(--border)] pt-4 text-xs text-[color:var(--neutral-500)] flex flex-wrap items-center justify-between gap-2">
        <div>
          💡 <strong>Astuce :</strong> Chaque template débloqué avec tes coins reste accessible sans limite de temps. Le coût en coins est calculé automatiquement selon le poids du fichier (ex: 10 coins jusqu&apos;à 50 Mo, 15 coins jusqu&apos;à 100 Mo, etc.).
        </div>
      </div>

      {/* Modal de Déblocage */}
      <UnlockConfirmModal
        file={unlockTarget}
        balance={walletBalance}
        onClose={() => setUnlockTarget(null)}
        onSuccess={(newBalance, fileId) => {
          setWalletBalance(newBalance);
          setUnlockedFileIds((prev) => [...prev, fileId]);
          loadWallet();
        }}
        onOpenRecharge={() => setRechargeModalOpen(true)}
      />
    </div>
  );
}
