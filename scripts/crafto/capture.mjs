import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { createRequire } from "node:module";

const build = path.resolve(process.argv[2]);
const require = createRequire(process.env.CRAFTO_NODE_MODULES
  ? path.join(process.env.CRAFTO_NODE_MODULES, "package.json")
  : "C:/Users/krissiank/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/package.json");
const { chromium } = require("playwright");
const sharp = require("sharp");
const catalog = JSON.parse(await fs.readFile(path.join(build, "catalog.json"), "utf8"));
const entries = [...catalog.entries].sort((a, b) => Number(a.page === "index.html") - Number(b.page === "index.html"));
const force = catalog.branding === "FORGEIA" && process.env.FORGEIA_CAPTURE_RESUME !== "1";
const mime = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".jpg": "image/jpeg", ".png": "image/png" };
const root = path.join(build, "html");
const missing = new Set();
const server = http.createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/+/, "");
    const sourceRoot = relative.startsWith("thumbnails/") ? build : root;
    const file = path.resolve(sourceRoot, relative);
    if (!file.startsWith(sourceRoot + path.sep) || /\.(php|pem|env|key)$/i.test(file)) { res.writeHead(403).end(); return; }
    const bytes = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" }).end(bytes);
  } catch {
    missing.add(req.url);
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const installedBrowsers = [process.env.CRAFTO_BROWSER,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe"].filter(Boolean);
let executablePath;
for (const candidate of installedBrowsers) {
  if (await fs.access(candidate).then(() => true, () => false)) { executablePath = candidate; break; }
}
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
let position = 0;
let captured = 0;
const errors = [];
const scriptErrors = [];
try {
  await Promise.all(Array.from({ length: 4 }, async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
    await context.route("**/*", (route) => (route.request().url().startsWith(base) || route.request().url().startsWith("data:")) && !/\.(mp4|webm|mp3)(?:\?|$)/i.test(route.request().url()) ? route.continue() : route.abort());
    const page = await context.newPage();
    let currentEntry;
    page.on("pageerror", (error) => {
      if (currentEntry && scriptErrors.filter((item) => item.page === currentEntry.page).length < 5) {
        scriptErrors.push({ page: currentEntry.page, error: error.message.slice(0, 300), stack: error.stack?.slice(0, 1000) });
      }
    });
    while (position < entries.length) {
      const entry = entries[position++];
      currentEntry = entry;
      const output = path.join(build, entry.thumbnail);
      if (!force && await fs.access(output).then(() => true, () => false)) continue;
      try {
        await page.goto(`${base}/${entry.page}`, { waitUntil: "load", timeout: 18000 });
        await page.waitForTimeout(1400);
        const close = page.locator("button.mfp-close:visible").first();
        if (await close.count()) await close.click();
        if (catalog.branding === "FORGEIA") {
          const branding = await page.evaluate(() => {
            const body = document.body.cloneNode(true);
            body.querySelectorAll("script,style,code,pre,canvas").forEach((node) => node.remove());
            return {
              title: document.title,
              oldText: /\b(?:Crafto|Canvas|ThemeZaa|SemiColonWeb)\b/i.test(body.textContent || ""),
              favicon: document.querySelector('link[rel="icon"]')?.getAttribute("href"),
              oldLinks: [...document.querySelectorAll("a[href]")].filter((a) => /themezaa|semicolonweb|canvastemplate|themeforest.*(?:crafto|canvas)/i.test(a.href)).slice(0, 2).map((a) => a.href),
            };
          });
          if (!branding.title.includes("FORGEIA") || branding.oldText || branding.oldLinks.length || !branding.favicon?.includes("forgeia-brand/")) {
            throw new Error(`Branding check failed: ${JSON.stringify(branding)}`);
          }
        }
        await page.addStyleTag({ content: ".preloader,.page-loader,.loader-wrapper{display:none!important} [data-anime],[data-anime] .word,[data-anime] .char{opacity:1!important;transform:none!important} *{animation-duration:0.01ms!important;transition-duration:0ms!important}" });
        const screenshot = await page.screenshot({ type: "jpeg", quality: 78, timeout: 10000 });
        await sharp(screenshot).resize(640, 480).jpeg({ quality: 76 }).toFile(output);
        captured++;
        if (captured % 25 === 0) console.log(JSON.stringify({ captured, scanned: position, total: catalog.total }));
      } catch (error) { errors.push({ page: entry.page, error: error.message.slice(0, 400) }); }
    }
    await context.close();
  }));
} finally {
  await browser.close();
  server.close();
}
await fs.writeFile(path.join(build, "capture-report.json"), JSON.stringify({ captured, errors, scriptErrors, missing: [...missing].sort() }, null, 2));
console.log(JSON.stringify({ captured, errors, scriptErrorCount: scriptErrors.length, missing: [...missing].sort() }));
if (errors.length || [...missing].some((file) => /\.(?:css|js|woff2?|ttf)(?:\?|$)/i.test(file))) process.exitCode = 1;
