import { homedir } from "node:os";
import * as vscode from "vscode";
import { exchangeLinkToken, getMe, IA_BASE_URL, siteUrl } from "./api";
import { clearKiloApiKey, installAdaptAgents, writeKiloConfig } from "./kilo-config";

const SECRET_KEY = "forgeia.apiKey";
const PREVIOUS_MODEL_KEY = "forgeia.previousModel";
const changed = new vscode.EventEmitter<void>();

/** Déclenché à chaque connexion / déconnexion (la barre d'état se met à jour). */
export const onDidChangeAuth = changed.event;

export function getKey(ctx: vscode.ExtensionContext): Thenable<string | undefined> {
  return ctx.secrets.get(SECRET_KEY);
}

export async function signIn(ctx: vscode.ExtensionContext, apiKey: string, firstName: string) {
  await ctx.secrets.store(SECRET_KEY, apiKey);
  const home = homedir();
  // Toujours l'adresse officielle de la passerelle, jamais une adresse fournie par un serveur.
  const previous = await writeKiloConfig(home, { apiKey, baseUrl: IA_BASE_URL });
  // On garde le modèle personnel de l'apprenant (pas celui de FORGE IA) pour le lui rendre à la déconnexion.
  if (previous && !previous.startsWith("forgeia/")) await ctx.globalState.update(PREVIOUS_MODEL_KEY, previous);
  await installAdaptAgents(home, ctx.asAbsolutePath("agents"));
  changed.fire();

  const reload = "Recharger VS Code";
  const choice = await vscode.window.showInformationMessage(
    `Connecté, ${firstName} ! Ouvre Kilo Code et choisis un mode ADAPT (forgeia-…). Recharge VS Code si Kilo était déjà ouvert.`,
    reload,
  );
  if (choice === reload) await vscode.commands.executeCommand("workbench.action.reloadWindow");
}

export async function signInWithLinkToken(ctx: vscode.ExtensionContext, token: string) {
  try {
    const { apiKey, firstName } = await exchangeLinkToken(token);
    await signIn(ctx, apiKey, firstName);
  } catch (error) {
    vscode.window.showErrorMessage(`Connexion FORGE IA impossible : ${(error as Error).message}`);
  }
}

export async function enterKey(ctx: vscode.ExtensionContext) {
  const apiKey = (
    await vscode.window.showInputBox({
      title: "FORGE IA : saisir ma clé",
      prompt: "Colle ta clé personnelle (espace FORGE IA → Mon assistant IA).",
      password: true,
      ignoreFocusOut: true,
    })
  )?.trim();
  if (!apiKey) return;
  try {
    const me = await getMe(apiKey);
    await signIn(ctx, apiKey, me.firstName);
  } catch {
    vscode.window.showErrorMessage("Clé refusée par FORGE IA");
  }
}

export async function signOut(ctx: vscode.ExtensionContext) {
  await ctx.secrets.delete(SECRET_KEY);
  await clearKiloApiKey(homedir(), ctx.globalState.get<string>(PREVIOUS_MODEL_KEY));
  await ctx.globalState.update(PREVIOUS_MODEL_KEY, undefined);
  changed.fire();
  vscode.window.showInformationMessage("FORGEIA CODE est déconnecté de ton compte.");
}

export function openConnectPage() {
  return vscode.env.openExternal(vscode.Uri.parse(`${siteUrl()}/espace/assistant-ia`));
}
