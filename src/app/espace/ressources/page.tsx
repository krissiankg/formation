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
          <span className="text-xs text-white/70">
            Compatible avec vos agents de code via le protocole standard OpenAI compatible.
          </span>
        </div>
      </div>

      {/* 💻 FORGEIA CODE — Extension VS Code Officielle */}
      <div className="overflow-hidden rounded-2xl border border-[color:var(--border)] bg-card p-6 text-card-foreground sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[color:var(--accent)]/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-[color:var(--accent)]">
                v1.0.0
              </span>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-medium text-primary">
                Extension VS Code Dédiée
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              FORGEIA CODE
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              L’agent IA autonome officiel de la formation pour VS Code. Pré-configuré avec la passerelle FORGEIA,
              il crée des fichiers, exécute le terminal, interagit avec le navigateur et bâtit tes SaaS pas à pas sous ta supervision.
            </p>
          </div>

          <a
            href="/downloads/forgeia-code-1.0.0.vsix"
            download="forgeia-code-1.0.0.vsix"
            className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]"
          >
            <svg
              className="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Télécharger FORGEIA CODE (.vsix)
          </a>
        </div>

        {/* Guide d'installation étape par étape */}
        <div className="mt-8 rounded-xl border border-[color:var(--border)] bg-muted/40 p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Comment installer dans VS Code en 3 étapes :
          </h3>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                1
              </span>
              <span>
                Télécharge le fichier <strong>forgeia-code-1.0.0.vsix</strong> via le bouton ci-dessus.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                2
              </span>
              <span>
                Ouvre VS Code, rends-toi dans le menu <strong>Extensions</strong> (raccourci <kbd className="rounded border px-1 text-xs">Ctrl+Shift+X</kbd> ou <kbd className="rounded border px-1 text-xs">Cmd+Shift+X</kbd>), clique sur les <strong>trois petits points (⋯)</strong> en haut du panneau, puis sur <strong>« Installer à partir d'un fichier VSIX... »</strong>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                3
              </span>
              <span>
                Sélectionne le fichier téléchargé. L'icône <strong>FORGEIA CODE</strong> apparaît dans ta barre latérale. L'URL passerelle et le modèle DeepSeek sont déjà pré-remplis : colle simplement ta <strong>Clé Personnelle Étudiant</strong> ({studentApiKey}) pour commencer !
              </span>
            </li>
          </ol>
        </div>
      </div>

      <ResourcesPanel contents={ctx.contents} />
    </div>
  );
}
