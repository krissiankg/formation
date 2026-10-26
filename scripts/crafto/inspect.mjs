import fs from "node:fs/promises";
import path from "node:path";

const source = process.argv[2];
if (!source) throw new Error("Provide the Crafto package directory.");
const htmlRoot = path.join(source, "html");
const files = [];
async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== "node_modules") await walk(path.join(directory, entry.name));
    else if (entry.isFile()) {
      const absolute = path.join(directory, entry.name);
      files.push({ path: path.relative(source, absolute).replaceAll("\\", "/"), bytes: (await fs.stat(absolute)).size });
    }
  }
}
await walk(source);
const start = await fs.readFile(path.join(source, "start-here.html"), "utf8");
const homes = [...start.matchAll(/href="html\/([^"]+\.html)"[^>]*class="demo-item"[^>]*>([^<]+)</g)]
  .map((match) => ({ file: match[1], title: match[2] }));
const pages = (await fs.readdir(htmlRoot)).filter((name) => name.endsWith(".html"));
const directories = {};
for (const file of files) {
  const group = /^html\/[^/]+\.html$/.test(file.path) ? "html/pages" : file.path.split("/").slice(0, 2).join("/");
  directories[group] ??= { files: 0, bytes: 0 };
  directories[group].files += 1;
  directories[group].bytes += file.bytes;
}
const runtimeModules = "C:/Users/krissiank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const modules = {};
for (const name of ["playwright", "playwright-core", "sharp", "cheerio", "archiver", "jszip"]) {
  modules[name] = await fs.access(path.join(runtimeModules, name, "package.json")).then(() => true, () => false);
}
console.log(JSON.stringify({
  totalFiles: files.length, totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  htmlPages: pages.length, homeCount: homes.length, homeExamples: homes.slice(0, 4), directories, modules,
  previewCandidates: files.filter((file) => /\.(png|jpe?g|webp)$/i.test(file.path) && /thumb|preview|demo-crafto|demo-accounting/i.test(file.path)).slice(0, 15),
  serverFiles: files.filter((file) => /\.(php|env|pem|key)$/i.test(file.path)).map((file) => file.path),
}, null, 2));
