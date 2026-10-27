"use client";

import { useCallback, useEffect, useState } from "react";
import { DriveResourcesExplorer } from "@/components/espace/drive-resources-explorer";
import { PaidResourcesPanel } from "@/components/espace/PaidResourcesPanel";
import { CoinsShopSection } from "@/components/espace/CoinsShopSection";
import { WebsiteExamplesGallery } from "@/components/espace/WebsiteExamplesGallery";
import { resolveResourceTab, type ResourceTab } from "@/lib/resources/navigation";
import type { ContentItem } from "@/lib/store/content";

interface ResourcesHubClientProps {
  contents: ContentItem[];
  examplesAvailable: boolean;
  initialTab?: string;
  audience?: "student" | "admin";
}

const collections = [
  { id: "ui-kits", mark: "UI", title: "Kits UI & code", description: "Maquettes, composants et sources UI8 pour créer tes interfaces.", detail: "Design & développement", colour: "bg-violet-50 text-violet-800" },
  { id: "wordpress", mark: "W", title: "Templates WordPress", description: "Thèmes et ressources pour personnaliser un site WordPress.", detail: "Pour WordPress", colour: "bg-sky-50 text-sky-800" },
  { id: "sites", mark: "</>", title: "Sites HTML", description: "Sites et pages FORGEIA à prévisualiser, télécharger et adapter.", detail: "HTML · CSS · JavaScript", colour: "bg-emerald-50 text-emerald-800" },
] as const;

export function ResourcesHubClient({ contents, examplesAvailable, initialTab, audience = "student" }: ResourcesHubClientProps) {
  const [activeTab, setActiveTab] = useState<ResourceTab>(() => resolveResourceTab(initialTab, examplesAvailable, audience));
  const publishedCount = contents.filter((content) => content.published).length;

  const selectTab = useCallback((tab: ResourceTab) => {
    if (audience === "admin" && (tab === "coins" || tab === "course-docs")) return;
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState(null, "", url);
  }, [audience]);

  useEffect(() => {
    function restoreTab() {
      setActiveTab(resolveResourceTab(new URLSearchParams(window.location.search).get("tab") ?? undefined, examplesAvailable, audience));
    }
    function openCoins() { selectTab("coins"); }
    window.addEventListener("popstate", restoreTab);
    window.addEventListener("open-coins-tab", openCoins);
    return () => {
      window.removeEventListener("popstate", restoreTab);
      window.removeEventListener("open-coins-tab", openCoins);
    };
  }, [audience, examplesAvailable, selectTab]);

  const secondaryTabs: { id: ResourceTab; label: string }[] = [
    { id: "drive", label: "Toutes les archives Drive" },
    ...(audience === "student" ? [
      { id: "course-docs" as const, label: "Supports du cours" + (publishedCount ? " (" + publishedCount + ")" : "") },
      { id: "coins" as const, label: "Mon portefeuille" },
    ] : []),
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Ressources FORGEIA</p>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Bibliothèque de ressources</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[color:var(--neutral-600)]">
            Choisis une ressource selon ton projet : concevoir une interface, créer un site WordPress ou adapter un site HTML.
          </p>
          {audience === "student"
            ? <p className="mt-2 text-xs font-semibold text-amber-900">Tous les fichiers se débloquent avec tes coins. Le prix est affiché avant chaque achat.</p>
            : <p className="mt-2 text-xs font-semibold text-emerald-800">Accès administrateur illimité à toutes les ressources. Téléchargement direct, sans coins.</p>}
        </div>
        {audience === "admin" && <a href="/admin/contenus" className="rounded-xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-xs font-semibold hover:bg-stone-50">Gérer les publications & Drive ↗</a>}
      </header>

      <nav aria-label="Collections de ressources" className="grid gap-3 sm:grid-cols-3">
        {collections.filter((item) => item.id !== "sites" || examplesAvailable).map((item) => {
          const active = activeTab === item.id;
          return <button key={item.id} type="button" onClick={() => selectTab(item.id)} aria-pressed={active}
            className={"group relative grid grid-cols-[2.25rem_1fr] items-center gap-x-3 rounded-2xl border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)] sm:block sm:p-5 " + (active ? "border-[color:var(--accent)] bg-white ring-1 ring-[color:var(--accent)]" : "border-[color:var(--border)] bg-white/60 hover:border-[color:var(--accent)] hover:bg-white")}>
            <span aria-hidden="true" className={"row-span-2 inline-flex size-9 items-center justify-center rounded-xl font-mono text-sm font-bold sm:mb-3 " + item.colour}>{item.mark}</span>
            <span className="block font-display text-sm font-bold">{item.title}</span>
            <span className="mt-2 hidden text-xs leading-relaxed text-[color:var(--neutral-600)] sm:block">{item.description}</span>
            <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-[color:var(--neutral-600)] sm:mt-3">{item.detail}</span>
            <span aria-hidden="true" className={"absolute right-4 top-4 hidden text-sm sm:block " + (active ? "text-[color:var(--accent)]" : "text-[color:var(--neutral-400)]")}>{active ? "●" : "↗"}</span>
          </button>;
        })}
      </nav>

      <nav aria-label="Autres ressources" className="flex flex-wrap items-center gap-2 border-b border-[color:var(--border)] pb-4">
        {secondaryTabs.map((tab) => <button key={tab.id} type="button" onClick={() => selectTab(tab.id)} aria-pressed={activeTab === tab.id}
          className={"rounded-full px-3.5 py-2 text-xs font-semibold transition-colors " + (activeTab === tab.id ? "bg-[color:var(--neutral-black)] text-white" : "text-[color:var(--neutral-600)] hover:bg-white hover:text-[color:var(--neutral-black)]")}>{tab.label}</button>)}
      </nav>

      <div key={activeTab}>
        {activeTab === "sites" && <WebsiteExamplesGallery audience={audience} />}
        {(activeTab === "ui-kits" || activeTab === "wordpress" || activeTab === "drive") && <DriveResourcesExplorer
          audience={audience}
          kind={activeTab === "ui-kits" ? "design-code" : activeTab === "wordpress" ? "wordpress" : "all"}
          onBrowseAll={() => selectTab("drive")}
        />}
        {audience === "student" && activeTab === "course-docs" && <PaidResourcesPanel contents={contents} />}
        {audience === "student" && activeTab === "coins" && <CoinsShopSection />}
      </div>
    </div>
  );
}
