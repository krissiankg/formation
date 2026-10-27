"use client";

import { useCallback, useEffect, useState } from "react";
import type { ContentAttachment, ContentItem } from "@/lib/store/content";
import type { CoinPack, CoinTransaction } from "@/lib/wallet/types";
import { calculateFileCoinsCost } from "@/lib/wallet/pricing";
import { contentAttachmentUnlockId } from "@/lib/resources/content-attachments";
import { formatFileSize } from "@/lib/format";
import { ResourcesPanel } from "./shared";
import { WalletWidget } from "./WalletWidget";
import { UnlockConfirmModal } from "./UnlockConfirmModal";

type Wallet = { balance: number; isAdmin: boolean; unlockedFileIds: string[]; packs: CoinPack[]; transactions: CoinTransaction[] };

export function PaidResourcesPanel({ contents }: { contents: ContentItem[] }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [error, setError] = useState("");
  const [target, setTarget] = useState<ContentAttachment | null>(null);
  const loadWallet = useCallback(async () => {
    try {
      const response = await fetch("/api/wallet", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Portefeuille indisponible.");
      setWallet(body);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Portefeuille indisponible.");
    }
  }, []);

  useEffect(() => { void loadWallet(); }, [loadWallet]);

  return <section className="space-y-5">
    {wallet && <WalletWidget {...wallet} onRefresh={loadWallet} />}
    <p className="text-xs text-[color:var(--neutral-600)]">Chaque fichier se débloque avec des coins selon son poids. Les fichiers déjà achetés restent téléchargeables sans nouveau débit.</p>
    {error && <p role="alert" className="text-sm text-red-800">{error} <button type="button" onClick={() => void loadWallet()} className="underline">Réessayer</button></p>}
    <ResourcesPanel contents={contents} renderAttachment={(attachment) => {
      const id = contentAttachmentUnlockId(attachment);
      const unlocked = wallet?.isAdmin || wallet?.unlockedFileIds.includes(id);
      const className = "flex w-full items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--neutral-50)] p-3 text-left text-xs disabled:opacity-50 hover:border-[color:var(--accent)]";
      const details = <>
        <span className="min-w-0"><span className="block break-words font-semibold">{attachment.name}</span><span className="mt-1 block text-[color:var(--neutral-500)]">{attachment.formattedSize || formatFileSize(attachment.size)}</span></span>
        <span className="shrink-0 rounded-lg bg-[color:var(--neutral-black)] px-3 py-2 font-semibold text-white">{unlocked ? "Télécharger" : `Débloquer · ${calculateFileCoinsCost(attachment.size)} coins`}</span>
      </>;
      return unlocked
        ? <a key={attachment.id} href={attachment.url} download={attachment.name} className={className}>{details}</a>
        : <button key={attachment.id} type="button" disabled={!wallet} onClick={() => setTarget(attachment)} className={className}>{details}</button>;
    }} />
    <UnlockConfirmModal key={target?.id || "closed"}
      file={target ? {
        id: contentAttachmentUnlockId(target), contentAttachmentId: target.id,
        name: target.name, size: target.size, formattedSize: target.formattedSize || formatFileSize(target.size),
        coinsCost: calculateFileCoinsCost(target.size),
      } : null}
      balance={wallet?.balance ?? 0} onClose={() => setTarget(null)}
      onSuccess={(balance, id) => setWallet((current) => current ? { ...current, balance, unlockedFileIds: [...new Set([...current.unlockedFileIds, id])] } : current)}
      onDownload={async () => { if (target) window.location.assign(target.url); }}
      onOpenRecharge={() => { setTarget(null); window.dispatchEvent(new CustomEvent("open-coins-tab")); }} />
  </section>;
}
