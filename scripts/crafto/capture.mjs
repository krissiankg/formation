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
const mime = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".jpg": "image/jpeg", ".png": "image/png" };
const root = path.join(build, "html");
const missing = new Set();
const server = http.createServer(async (req, res) => {
  try {
    const relative = decodeURIComponent(new URL(req.url, "http://localhost").pathname).replace(/^\/+/, "");
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const bytes = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" }).end(bytes);
  } catch {
    missing.add(req.url);
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true });
let position = 0;
let captured = 0;
const errors = [];
try {
  await Promise.all(Array.from({ length: 4 }, async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 960 }, deviceScaleFactor: 1 });
    await context.route("**/*", (route) => route.request().url().startsWith(base) || route.request().url().startsWith("data:") ? route.continue() : route.abort());
    const page = await context.newPage();
    while (position < catalog.entries.length) {
      const entry = catalog.entries[position++];
      const output = path.join(build, entry.thumbnail);
      if (await fs.access(output).then(() => true, () => false)) continue;
      try {
        await page.goto(`${base}/${entry.page}`, { waitUntil: "load", timeout: 18000 });
        await page.waitForTimeout(450);
        await page.addStyleTag({ content: ".preloader,.page-loader,.loader-wrapper{display:none!important} [data-anime]{opacity:1!important} *{animation-duration:0.01ms!important;transition-duration:0ms!important}" });
        const screenshot = await page.screenshot({ type: "jpeg", quality: 78, timeout: 10000 });
        await sharp(screenshot).resize(640, 480).jpeg({ quality: 76 }).toFile(output);
        captured++;
        if (captured % 25 === 0) console.log(JSON.stringify({ captured, scanned: position, total: catalog.total }));
      } catch (error) { errors.push({ page: entry.page, error: error.message.slice(0, 180) }); }
    }
    await context.close();
  }));
} finally {
  await browser.close();
  server.close();
}
await fs.writeFile(path.join(build, "capture-report.json"), JSON.stringify({ captured, errors, missing: [...missing].sort() }, null, 2));
console.log(JSON.stringify({ captured, errors: errors.length, missing: missing.size }));
if (errors.length) process.exitCode = 1;
