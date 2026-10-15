import * as vscode from "vscode";
import { getMe, type Me } from "./api";
import { getKey, onDidChangeAuth } from "./auth";

const REFRESH_MS = 5 * 60 * 1000;
const LOW_FCFA = 500;

let item: vscode.StatusBarItem | undefined;
let lastMe: Me | null = null;

export function lastKnownMe(): Me | null {
  return lastMe;
}

const fcfa = (n: number) => `${Math.max(0, Math.floor(n)).toLocaleString("fr-FR")} F`;

/** Met à jour la barre d'état : invite de connexion, ou crédit IA restant. */
export async function refreshStatus(ctx: vscode.ExtensionContext): Promise<void> {
  if (!item) return;
  const key = await getKey(ctx);
  if (!key) {
    lastMe = null;
    item.text = "$(plug) FORGE IA : se connecter";
    item.tooltip = "Connecter FORGEIA CODE à ton compte FORGE IA";
    item.command = "forgeia.connect";
    item.backgroundColor = undefined;
    return;
  }
  item.command = "forgeia.menu";
  try {
    lastMe = await getMe(key);
    item.text = `$(sparkle) FORGE IA · ${fcfa(lastMe.remainingFcfa)}`;
    item.tooltip = `Crédit IA restant : ${fcfa(lastMe.remainingFcfa)} sur ${fcfa(lastMe.budgetFcfa)}. Clique pour le menu FORGE IA.`;
    item.backgroundColor =
      lastMe.remainingFcfa < LOW_FCFA ? new vscode.ThemeColor("statusBarItem.warningBackground") : undefined;
  } catch {
    item.text = "$(sparkle) FORGE IA · hors ligne";
    item.tooltip = "Impossible de joindre FORGE IA pour le moment. Clique pour le menu.";
  }
}

export function createStatus(ctx: vscode.ExtensionContext) {
  item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  item.show();
  const timer = setInterval(() => void refreshStatus(ctx), REFRESH_MS);
  ctx.subscriptions.push(item, { dispose: () => clearInterval(timer) }, onDidChangeAuth(() => void refreshStatus(ctx)));
  void refreshStatus(ctx);
}
