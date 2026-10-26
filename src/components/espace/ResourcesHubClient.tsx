"use client";

import { useState, useEffect } from "react";
import { DriveResourcesExplorer } from "@/components/espace/drive-resources-explorer";
import { ResourcesPanel } from "@/components/espace/shared";
import { CoinsShopSection } from "@/components/espace/CoinsShopSection";
import { WebsiteExamplesGallery } from "@/components/espace/WebsiteExamplesGallery";

interface ResourcesHubClientProps {
  contents: any[];
  examplesAvailable: boolean;
}

type TabType = "sites" | "templates" | "course-docs" | "coins";

export function ResourcesHubClient({ contents, examplesAvailable }: ResourcesHubClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>(examplesAvailable ? "sites" : "templates");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "coins" || tab === "templates" || tab === "course-docs" || (tab === "sites" && examplesAvailable)) setActiveTab(tab);
    }

    function handleOpenCoins() {
      setActiveTab("coins");
    }

    window.addEventListener("open-coins-tab", handleOpenCoins);
    return () => window.removeEventListener("open-coins-tab", handleOpenCoins);
  }, [examplesAvailable]);

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
            Explore les exemples de sites web, télécharge leurs sources et retrouve tes kits et supports de formation.
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
        {examplesAvailable && <button type="button" onClick={() => setActiveTab("sites")}
          className={`flex-1 min-w-fit rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer ${activeTab === "sites" ? "bg-white text-[color:var(--neutral-black)] shadow-xs border border-[color:var(--border)]" : "text-[color:var(--neutral-600)] hover:bg-white/50"}`}>
          Exemples de sites
        </button>}
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

        <button
          type="button"
          onClick={() => setActiveTab("coins")}
          className={`flex-1 min-w-fit inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
            activeTab === "coins"
              ? "bg-amber-500 text-white shadow-xs font-bold"
              : "text-[color:var(--neutral-600)] hover:text-amber-800 hover:bg-amber-500/10"
          }`}
        >
          <span>🪙</span>
          <span>Boutique Coins</span>
        </button>
      </div>

      {/* Contenu de l'onglet actif */}
      <div>
        {activeTab === "sites" && <WebsiteExamplesGallery />}
        {/* ONGLET 1 : Templates & Kits UI8 */}
        {activeTab === "templates" && (
          <div className="animate-in fade-in zoom-in-98 duration-200">
            <DriveResourcesExplorer />
          </div>
        )}

        {/* ONGLET 4 : Boutique & Recharge de Coins */}
        {activeTab === "coins" && (
          <div className="animate-in fade-in zoom-in-98 duration-200">
            <CoinsShopSection />
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
