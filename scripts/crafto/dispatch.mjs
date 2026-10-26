import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [mode, directory, bundle, previewUrl, release = "forgeia-sites-v2", sourceRelease = release, pack = "crafto"] = process.argv.slice(2);
if (!["prepare", "publish", "assets", "audit"].includes(mode)) throw new Error("Expected prepare, publish, assets or audit");
const hash = createHash("sha256");
let checksum;
const bytes = (await fs.stat(bundle)).size;
try {
  const manifest = JSON.parse(await fs.readFile(bundle.replace(/\.zip$/i, ".json"), "utf8"));
  if (manifest.bytes === bytes && /^[a-f0-9]{64}$/.test(manifest.sha256)) checksum = manifest.sha256;
} catch (error) { if (error.code !== "ENOENT") throw error; }
if (!checksum) {
  for await (const chunk of createReadStream(bundle, { highWaterMark: 8 * 1024 * 1024 })) hash.update(chunk);
  checksum = hash.digest("hex");
}
if (!/^[a-z0-9-]{1,60}$/.test(release) || !/^[a-z0-9-]{1,60}$/.test(sourceRelease)) throw new Error("Invalid release");
if (!["crafto", "canvas"].includes(pack)) throw new Error("Invalid source pack");
const input = { mode, pack, release, source_release: sourceRelease, sha256: checksum, bytes: String(bytes) };
if (mode === "prepare") input.public_key = (await fs.readFile(path.join(directory, "upload-public.txt"), "utf8")).trim();
else {
  if (!/^https:\/\/[a-z0-9]+\.cloudfront\.net$/.test(previewUrl || "")) throw new Error("Provide the isolated preview origin");
  input.preview_url = previewUrl;
}
await fs.writeFile(path.join(directory, "upload-request.json"), JSON.stringify({ ...input, public_key: undefined }, null, 2));
const result = spawnSync("gh", ["workflow", "run", "publish-examples.yml", "--repo", "krissiankg/formation", "--ref", "main", "--json"], { input: JSON.stringify(input), encoding: "utf8", timeout: 45000 });
if (result.status !== 0) throw new Error(result.stderr || "Workflow dispatch failed");
console.log(JSON.stringify({ dispatched: mode, sha256: input.sha256, bytes: input.bytes }));
