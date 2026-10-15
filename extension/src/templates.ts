import { existsSync } from "node:fs";
import { cp, readdir } from "node:fs/promises";
import { join } from "node:path";

export type TemplateId = "landing" | "site" | "saas";

export const TEMPLATES: { id: TemplateId; label: string; description: string }[] = [
  { id: "landing", label: "Projet 1 — Landing page (UI8 / Figma)", description: "Une page de vente à partir d'une maquette" },
  { id: "site", label: "Projet 2 — Site vitrine (WordPress → code)", description: "Plusieurs pages, formulaire de contact" },
  { id: "saas", label: "Projet 3 — Mon SaaS (Supabase + FedaPay)", description: "Comptes, données et paiement Mobile Money" },
];

/** Copie un modèle de projet dans un dossier vide ; renvoie la liste des fichiers copiés. */
export async function copyTemplate(id: TemplateId, sourceRoot: string, targetDir: string): Promise<string[]> {
  if (existsSync(targetDir) && (await readdir(targetDir)).length > 0) {
    throw new Error("Le dossier doit être vide");
  }
  const source = join(sourceRoot, id);
  await cp(source, targetDir, { recursive: true });
  return readdir(source);
}
