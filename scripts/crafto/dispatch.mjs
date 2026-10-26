import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [mode, directory, bundle, previewUrl] = process.argv.slice(2);
if (!["prepare", "publish"].includes(mode)) throw new Error("Expected prepare or publish");
const hash = createHash("sha256");
for await (const chunk of createReadStream(bundle)) hash.update(chunk);
const input = { mode, release: "crafto-v1", sha256: hash.digest("hex"), bytes: String((await fs.stat(bundle)).size) };
if (mode === "prepare") input.public_key = (await fs.readFile(path.join(directory, "upload-public.txt"), "utf8")).trim();
else {
  if (!/^https:\/\/[a-z0-9]+\.cloudfront\.net$/.test(previewUrl || "")) throw new Error("Provide the isolated preview origin");
  input.preview_url = previewUrl;
}
await fs.writeFile(path.join(directory, "upload-request.json"), JSON.stringify({ ...input, public_key: undefined }, null, 2));
const result = spawnSync("gh", ["workflow", "run", "publish-examples.yml", "--repo", "krissiankg/formation", "--ref", "main", "--json"], { input: JSON.stringify(input), encoding: "utf8", timeout: 45000 });
if (result.status !== 0) throw new Error(result.stderr || "Workflow dispatch failed");
console.log(JSON.stringify({ dispatched: mode, sha256: input.sha256, bytes: input.bytes }));
