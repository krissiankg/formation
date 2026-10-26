import fs from "node:fs/promises";

const [catalogFile, base, release, reportFile] = process.argv.slice(2);
if (!/^https:\/\/[a-z0-9]+\.cloudfront\.net$/.test(base || "") || !/^[a-z0-9-]+$/.test(release || "")) throw new Error("Invalid preview URL");
const catalog = JSON.parse(await fs.readFile(catalogFile, "utf8"));
const checks = [];
for (const entry of catalog.entries) {
  if (!/^[a-z0-9-]+\.html$/.test(entry.page) || !/^thumbnails\/[a-z0-9-]+\.jpg$/.test(entry.thumbnail)) throw new Error("Invalid catalog path");
  checks.push({ path: entry.page, type: "text/html" }, { path: entry.thumbnail, type: "image/jpeg" });
}
let position = 0;
const failures = [];
await Promise.all(Array.from({ length: 12 }, async () => {
  while (position < checks.length) {
    const check = checks[position++];
    try {
      const response = await fetch(`${base}/${release}/${check.path}`, { method: "HEAD", signal: AbortSignal.timeout(20000) });
      if (!response.ok || !response.headers.get("content-type")?.startsWith(check.type)) failures.push({ path: check.path, status: response.status });
    } catch { failures.push({ path: check.path, error: "Connection failed" }); }
  }
}));
const catalogResponse = await fetch("https://www.forgeia.site/api/ressources/exemples");
await catalogResponse.arrayBuffer();
const downloadResponse = await fetch("https://www.forgeia.site/api/ressources/exemples/demo-accounting/download");
await downloadResponse.arrayBuffer();
const privateArchive = await fetch(`https://forgeia-uploads-555968473975-eu-west-3.s3.eu-west-3.amazonaws.com/website-examples/downloads/${release}/accounting.zip`, { method: "HEAD" });
const result = { checked: checks.length, failures, anonymousCatalogStatus: catalogResponse.status, anonymousDownloadStatus: downloadResponse.status, publicArchiveStatus: privateArchive.status };
if (reportFile) await fs.writeFile(reportFile, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
if (failures.length || catalogResponse.status !== 401 || downloadResponse.status !== 401 || privateArchive.status !== 403) process.exitCode = 1;
