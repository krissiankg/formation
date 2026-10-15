/** Version publiée de FORGEIA CODE (alignée sur extension/package.json lors de la mise en ligne). */
export const FORGEIA_CODE_VERSION = "2.0.0";

export const FORGEIA_CODE_DOWNLOAD_PATH = `/downloads/forgeia-code-${FORGEIA_CODE_VERSION}.vsix`;

/** Lien qui ouvre VS Code et connecte FORGEIA CODE au compte de l'apprenant. */
export function forgeiaCodeConnectUrl(linkToken: string) {
  return `vscode://guelichweb.forgeia-code/connect?token=${encodeURIComponent(linkToken)}`;
}
