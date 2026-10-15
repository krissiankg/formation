// Construit forgeia-code-<version>.vsix (ou le chemin passé en argument). Dépendances déjà intégrées par esbuild.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const out = process.argv[2] ?? `forgeia-code-${version}.vsix`;
execFileSync("npx", ["vsce", "package", "--no-dependencies", "-o", out], { stdio: "inherit", shell: true });
console.log(out);
