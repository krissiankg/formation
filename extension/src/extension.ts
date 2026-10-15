import * as vscode from "vscode";
import { enterKey, openConnectPage, signInWithLinkToken, signOut } from "./auth";
import { newProject, openDailyExercise, previewInBrowser, showMenu } from "./commands";
import { createStatus } from "./status";

const OLD_FORGEIA_ID = "forgeia.forgeia-code";

let output: vscode.OutputChannel | undefined;

/** Journal visible dans « Sortie → FORGEIA CODE ». */
export function log(message: string) {
  output?.appendLine(`[${new Date().toLocaleTimeString("fr-FR")}] ${message}`);
}

// Kilo Code est une dépendance obligatoire (extensionDependencies) : s'il manque, VS Code propose
// lui-même de l'installer avant d'activer FORGEIA CODE. Ici on ne gère que l'ancienne version 1.
async function checkCompanions() {
  if (vscode.extensions.getExtension(OLD_FORGEIA_ID)) {
    const remove = "Désinstaller l'ancienne version";
    const choice = await vscode.window.showWarningMessage(
      "L'ancienne FORGEIA CODE (v1) est encore installée. Désinstalle-la pour éviter deux assistants.",
      remove,
    );
    if (choice === remove) await vscode.commands.executeCommand("workbench.extensions.uninstallExtension", OLD_FORGEIA_ID);
  }
}

export function activate(context: vscode.ExtensionContext) {
  output = vscode.window.createOutputChannel("FORGEIA CODE");
  context.subscriptions.push(
    output,
    vscode.commands.registerCommand("forgeia.connect", openConnectPage),
    vscode.commands.registerCommand("forgeia.enterKey", () => enterKey(context)),
    vscode.commands.registerCommand("forgeia.signOut", () => signOut(context)),
    vscode.commands.registerCommand("forgeia.menu", () => showMenu(context)),
    vscode.commands.registerCommand("forgeia.dailyExercise", () => openDailyExercise(context)),
    vscode.commands.registerCommand("forgeia.preview", previewInBrowser),
    vscode.commands.registerCommand("forgeia.newProject", () => newProject(context)),
    vscode.window.registerUriHandler({
      handleUri(uri) {
        log(`Lien reçu : ${uri.path}`);
        if (uri.path !== "/connect") return;
        const token = new URLSearchParams(uri.query).get("token");
        if (token) void signInWithLinkToken(context, token);
      },
    }),
  );
  createStatus(context);
  if (!context.globalState.get("forgeia.walkthroughShown")) {
    void context.globalState.update("forgeia.walkthroughShown", true);
    void vscode.commands.executeCommand("workbench.action.openWalkthrough", "guelichweb.forgeia-code#start", false);
  }
  log("FORGEIA CODE activé.");
  void checkCompanions();
}

export function deactivate() {}
