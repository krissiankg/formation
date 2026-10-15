import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { applyEdits, modify, type FormattingOptions } from "jsonc-parser";

/**
 * Configuration de Kilo Code (format documenté par Kilo) : fournisseur « forgeia » vers la passerelle
 * FORGE IA et modèle par défaut. On modifie le fichier sur place pour garder les commentaires et les
 * réglages personnels de l'apprenant.
 */
export type ForgeiaProviderOptions = { apiKey: string; baseUrl: string };

const FORMAT: FormattingOptions = { insertSpaces: true, tabSize: 2, eol: "\n" };
const LIMIT = { context: 128000, output: 16384 };

export const FORGEIA_DEFAULT_MODEL = "forgeia/forgeia-coder";

function forgeiaProvider({ apiKey, baseUrl }: ForgeiaProviderOptions) {
  return {
    npm: "@ai-sdk/openai-compatible",
    name: "FORGE IA",
    options: { baseURL: baseUrl, apiKey },
    models: {
      "forgeia-coder": { name: "FORGE IA Coder (DeepSeek)", limit: LIMIT },
      "deepseek-v4-pro": { name: "DeepSeek Pro (tâches difficiles)", limit: LIMIT },
      "kimi-k3": { name: "Kimi K3", limit: LIMIT },
    },
  };
}

function edit(text: string, path: (string | number)[], value: unknown): string {
  return applyEdits(text, modify(text, path, value, { formattingOptions: FORMAT }));
}

export function applyForgeiaProvider(text: string, opts: ForgeiaProviderOptions): string {
  let out = text.trim() ? text : "{}";
  out = edit(out, ["provider", "forgeia"], forgeiaProvider(opts));
  out = edit(out, ["model"], FORGEIA_DEFAULT_MODEL);
  return out;
}

export function removeForgeiaApiKey(text: string): string {
  return edit(text, ["provider", "forgeia", "options", "apiKey"], undefined);
}

export function kiloConfigDir(home: string): string {
  return join(home, ".config", "kilo");
}

/** Fichier de configuration global de Kilo : kilo.json s'il existe déjà, sinon kilo.jsonc. */
export function kiloConfigPath(home: string): string {
  const dir = kiloConfigDir(home);
  const json = join(dir, "kilo.json");
  return existsSync(json) && !existsSync(join(dir, "kilo.jsonc")) ? json : join(dir, "kilo.jsonc");
}

async function readConfig(path: string): Promise<string> {
  return existsSync(path) ? readFile(path, "utf8") : '{\n  "$schema": "https://app.kilo.ai/config.json"\n}';
}

export async function writeKiloConfig(home: string, opts: ForgeiaProviderOptions): Promise<string> {
  const path = kiloConfigPath(home);
  await mkdir(kiloConfigDir(home), { recursive: true });
  await writeFile(path, applyForgeiaProvider(await readConfig(path), opts), "utf8");
  return path;
}

export async function clearKiloApiKey(home: string): Promise<void> {
  const path = kiloConfigPath(home);
  if (!existsSync(path)) return;
  await writeFile(path, removeForgeiaApiKey(await readFile(path, "utf8")), "utf8");
}

/** Copie les agents ADAPT (fichiers forgeia-*.md) dans le dossier global des agents Kilo. */
export async function installAdaptAgents(home: string, sourceDir: string): Promise<string[]> {
  const target = join(kiloConfigDir(home), "agent");
  await mkdir(target, { recursive: true });
  const files = (await readdir(sourceDir)).filter((f) => f.startsWith("forgeia-") && f.endsWith(".md"));
  await Promise.all(files.map((f) => copyFile(join(sourceDir, f), join(target, f))));
  return files;
}
