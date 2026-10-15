/** Options esbuild partagées par le build et par le test du bundle. */
export const buildOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  format: "cjs",
  platform: "node",
  target: "node20",
  external: ["vscode"],
  // jsonc-parser publie un build UMD à require dynamiques que esbuild ne peut pas intégrer : on prend son build ESM.
  mainFields: ["module", "main"],
  logLevel: "info",
};
