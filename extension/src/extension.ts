import * as vscode from "vscode";

let output: vscode.OutputChannel | undefined;

/** Journal visible dans « Sortie → FORGEIA CODE ». */
export function log(message: string) {
  output?.appendLine(`[${new Date().toLocaleTimeString("fr-FR")}] ${message}`);
}

export function activate(context: vscode.ExtensionContext) {
  output = vscode.window.createOutputChannel("FORGEIA CODE");
  context.subscriptions.push(output);
  log("FORGEIA CODE activé.");
}

export function deactivate() {}
