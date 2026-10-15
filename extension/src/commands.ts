import * as vscode from "vscode";
import { siteUrl } from "./api";
import { signOut } from "./auth";
import { lastKnownMe, refreshStatus } from "./status";

const open = (url: string) => vscode.env.openExternal(vscode.Uri.parse(url));

export async function openDailyExercise(ctx: vscode.ExtensionContext) {
  await refreshStatus(ctx);
  const lesson = lastKnownMe()?.currentLesson;
  if (!lesson) {
    vscode.window.showInformationMessage("Aucun exercice ouvert pour l'instant.");
    return;
  }
  await open(lesson.url);
}

/** Ouvre un site (par défaut le serveur local) dans le navigateur intégré de VS Code. */
export async function previewInBrowser() {
  const url = await vscode.window.showInputBox({
    title: "Aperçu dans le navigateur interne",
    prompt: "Adresse à afficher (ton site lancé en local, ou une page en ligne)",
    value: "http://localhost:3000",
    ignoreFocusOut: true,
  });
  if (url) await vscode.commands.executeCommand("simpleBrowser.show", url);
}

export async function showMenu(ctx: vscode.ExtensionContext) {
  const items: (vscode.QuickPickItem & { run: () => unknown })[] = [
    { label: "$(book) Exercice du jour", run: () => openDailyExercise(ctx) },
    { label: "$(new-folder) Nouveau projet de la formation", run: () => vscode.commands.executeCommand("forgeia.newProject") },
    { label: "$(globe) Aperçu dans le navigateur interne", run: previewInBrowser },
    { label: "$(credit-card) Mon crédit IA", run: () => open(`${siteUrl()}/espace/assistant-ia`) },
    { label: "$(rocket) Déposer mon projet", run: () => open(`${siteUrl()}/espace/projets`) },
    { label: "$(sign-out) Se déconnecter", run: () => signOut(ctx) },
  ];
  const picked = await vscode.window.showQuickPick(items, { title: "FORGE IA", placeHolder: "Que veux-tu faire ?" });
  await picked?.run();
}
