import { redirect } from "next/navigation";
import { PageHeader, ResourcesPanel } from "@/components/espace/shared";
import { brand } from "@/lib/config/formation";
import { getStudentContext } from "@/lib/store/student-context";

export const metadata = {
  title: `Ressources — ${brand.name}`,
};

export const dynamic = "force-dynamic";

export default async function RessourcesPage() {
  const ctx = await getStudentContext();
  if (!ctx) redirect("/connexion");

  // Génération de la clé étudiante déterministe basée sur l'inscription
  const studentSlug = ctx.enrollment.fullName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 15);
  const studentApiKey = `forge_${studentSlug}_${ctx.enrollment.id.slice(0, 6)}`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        kicker="Ressources"
        title="Outils & codes"
        description="Tout ce que le formateur publie pour ta formation apparaît ici. Tu seras aussi notifié sur WhatsApp."
      />

      {/* 🚀 Bloc IA Privée FORGE IA */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[#171d17] p-6 text-[#fbfaf4] sm:p-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--accent)]/15 px-3 py-1 font-mono text-xs uppercase tracking-wider text-[color:var(--accent)] font-semibold">
              <span className="size-2 rounded-full bg-[color:var(--accent)] animate-pulse" />
              IA Privée Active
            </span>
            <h2 className="font-display mt-3 text-2xl tracking-tight sm:text-3xl text-white">
              Forge IA Assistant
            </h2>
            <p className="mt-2 text-sm text-white/70 max-w-xl">
              Ton environnement de développement avec agent IA autonome (terminal, navigateur headless et génération illimitée pour tes projets).
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* URL Serveur */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-white/50">URL API Passerelle</p>
            <p className="mt-1 font-mono text-sm text-[color:var(--accent)] font-medium break-all">
              https://ia.guelichweb.store/v1
            </p>
          </div>

          {/* Clé Personnelle */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-white/50">Ta Clé Personnelle Étudiant</p>
            <p className="mt-1 font-mono text-sm text-white font-medium break-all bg-black/40 px-2 py-1 rounded">
              {studentApiKey}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
          <a
            href="/downloads/forgeia-assistant.vsix"
            download="forgeia-assistant.vsix"
            className="btn-primary !bg-[color:var(--accent)] !text-[color:var(--neutral-black)] hover:!bg-[color:var(--accent-light)] font-medium inline-flex items-center gap-2 shadow-md"
          >
            <span>📥 Télécharger l&apos;extension Forge IA (.vsix)</span>
          </a>
          <a
            href="https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost !text-white/80 hover:!text-white !border-white/20 text-xs"
          >
            Alternative Cline VS Code
          </a>
          <span className="text-xs text-white/50 block sm:inline">
            Compatible VS Code, Cursor, Windsurf &amp; VSCodium.
          </span>
        </div>
      </div>

      <ResourcesPanel contents={ctx.contents} />
    </div>
  );
}
