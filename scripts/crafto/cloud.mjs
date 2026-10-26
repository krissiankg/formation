// GitHub Actions uses its existing OIDC role; no production secret is read.
import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { mergeCatalogs } from "./catalog-merge.mjs";
import { createHash, randomBytes, createCipheriv, publicEncrypt } from "node:crypto";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({ region: "eu-west-3", requestChecksumCalculation: "WHEN_REQUIRED" });
const bucket = "forgeia-uploads-555968473975-eu-west-3";
const release = process.env.RELEASE;
if (!/^[a-z0-9-]{1,60}$/.test(release || "")) throw new Error("Invalid release");
const checksum = process.env.SHA256;
if (!/^[a-f0-9]{64}$/.test(checksum || "")) throw new Error("Invalid SHA256");
const sourceRelease = process.env.SOURCE_RELEASE || release;
if (!/^[a-z0-9-]{1,60}$/.test(sourceRelease)) throw new Error("Invalid source release");
const key = `website-examples/staging/${sourceRelease}/${checksum}.zip`;
const mode = process.argv[2];
const pack = process.env.SOURCE_PACK || "crafto";
if (!["crafto", "canvas"].includes(pack)) throw new Error("Invalid source pack");

if (mode === "prepare") {
  const bytes = Number(process.env.BUNDLE_BYTES);
  if (!Number.isSafeInteger(bytes) || bytes <= 0 || bytes > 2_000_000_000) throw new Error("Invalid bundle size");
  const sha256 = Buffer.from(checksum, "hex").toString("base64");
  const url = await getSignedUrl(client, new PutObjectCommand({
    Bucket: bucket, Key: key, ContentType: "application/zip", ContentLength: bytes, ChecksumSHA256: sha256,
  }), { expiresIn: 3600, signableHeaders: new Set(["content-type"]), unhoistableHeaders: new Set(["x-amz-checksum-sha256"]) });
  const target = JSON.stringify({ url, headers: { "content-type": "application/zip", "content-length": String(bytes), "x-amz-checksum-sha256": sha256 } });
  const symmetricKey = randomBytes(32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", symmetricKey, iv);
  const encrypted = Buffer.concat([cipher.update(target, "utf8"), cipher.final()]);
  const publicKey = Buffer.from(process.env.UPLOAD_PUBLIC_KEY, "base64").toString("utf8");
  const wrapped = publicEncrypt({ key: publicKey, oaepHash: "sha256" }, symmetricKey);
  await fs.writeFile("upload-target.encrypted.json", JSON.stringify({ key: wrapped.toString("base64"), iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: encrypted.toString("base64") }));
  console.log("Encrypted upload target ready.");
} else if (mode === "fetch") {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const hash = createHash("sha256");
  let bytes = 0;
  await pipeline(response.Body, new Transform({ transform(chunk, _encoding, done) { hash.update(chunk); bytes += chunk.length; done(null, chunk); } }), createWriteStream("crafto.zip"));
  if (hash.digest("hex") !== checksum) throw new Error("Bundle checksum mismatch");
  console.log(`Verified source bundle: ${bytes} bytes`);
} else if (mode === "archives") {
  if (pack !== "canvas") throw new Error("Streaming archives require the second collection");
  const recipes = JSON.parse(await fs.readFile("crafto-build/recipes.json", "utf8"));
  const expected = new Set(recipes.map((recipe) => recipe.id));
  const completed = {};
  const child = spawn("python", ["scripts/crafto/canvas.py", "archives", "crafto-build", "crafto-archives",
    "--preview-url", `${process.env.PREVIEW_URL}/${release}`, "--stream"], { stdio: ["pipe", "pipe", "inherit"] });
  const finished = new Promise((resolve) => { child.once("exit", (code) => resolve(code)); child.once("error", () => resolve(-1)); });
  try {
    for await (const line of createInterface({ input: child.stdout, crlfDelay: Infinity })) {
      const item = JSON.parse(line);
      if (!/^[a-z0-9-]{1,100}$/.test(item.archive) || !expected.has(item.archive) || completed[item.archive]) throw new Error("Unexpected archive");
      const file = path.join("crafto-archives", `${item.archive}.zip`);
      const stat = await fs.stat(file);
      if (stat.size !== item.bytes || stat.size < 500) throw new Error("Incomplete archive");
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: `website-examples/downloads/${release}/${item.archive}.zip`,
        Body: createReadStream(file), ContentLength: stat.size, ContentType: "application/zip", CacheControl: "private, no-store" }));
      completed[item.archive] = stat.size;
      await fs.unlink(file);
      child.stdin.write("ok\n");
      if (Object.keys(completed).length % 25 === 0) console.log(JSON.stringify({ archivesUploaded: Object.keys(completed).length, total: recipes.length }));
    }
    if (await finished !== 0 || Object.keys(completed).length !== expected.size) throw new Error("Archive generation failed");
    await fs.writeFile("crafto-build/archive-index.json", JSON.stringify({ release, archives: completed }));
    console.log(JSON.stringify({ archivesUploaded: expected.size, bytes: Object.values(completed).reduce((sum, bytes) => sum + bytes, 0) }));
  } finally { if (child.exitCode === null) child.kill(); }
} else if (mode === "publish" || mode === "assets") {
  const build = path.resolve("crafto-build");
  const catalog = JSON.parse(await fs.readFile(path.join(build, "catalog.json"), "utf8"));
  const archiveIndex = pack === "canvas" && mode === "publish" ? JSON.parse(await fs.readFile(path.join(build, "archive-index.json"), "utf8")) : null;
  if (archiveIndex && archiveIndex.release !== release) throw new Error("Archive release mismatch");
  for (const entry of mode === "publish" ? catalog.entries : []) {
    if ((await fs.stat(path.join(build, entry.thumbnail))).size < 500) throw new Error(`Missing thumbnail: ${entry.id}`);
    await fs.access(path.join(build, "html", entry.page));
    if (archiveIndex) {
      if (!Number.isSafeInteger(archiveIndex.archives[entry.archive]) || archiveIndex.archives[entry.archive] < 500) throw new Error(`Missing uploaded archive: ${entry.id}`);
    } else await fs.access(path.join("crafto-archives", `${entry.archive}.zip`));
  }
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".ico": "image/x-icon", ".cur": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".otf": "font/otf", ".eot": "application/vnd.ms-fontobject", ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg", ".ogg": "audio/ogg" };
  async function put(file, objectKey, contentType, cache = "public, max-age=31536000, immutable") {
    const stat = await fs.stat(file);
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey, Body: createReadStream(file), ContentLength: stat.size, ContentType: contentType, CacheControl: cache }));
  }
  async function walk(directory) {
    const files = [];
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory()) files.push(...await walk(path.join(directory, entry.name)));
      else files.push(path.join(directory, entry.name));
    }
    return files;
  }
  const tasks = [];
  for (const folder of mode === "publish" ? ["html", "thumbnails"] : ["html"]) {
    for (const file of await walk(path.join(build, folder))) {
      const ext = path.extname(file).toLowerCase();
      if (!types[ext] || /(?:^|[/\\])(?:sass|email-templates)(?:[/\\])/.test(file) || ["package.json", "composer.json"].includes(path.basename(file))) continue;
      const relative = path.relative(path.join(build, folder), file).replaceAll("\\", "/");
      const objectKey = `website-examples/previews/${release}/${folder === "thumbnails" ? "thumbnails/" : ""}${relative}`;
      tasks.push(() => put(file, objectKey, types[ext]));
    }
  }
  const archiveFiles = mode === "publish" && !archiveIndex ? await walk("crafto-archives") : [];
  for (const file of archiveFiles) tasks.push(() => put(file, `website-examples/downloads/${release}/${path.basename(file)}`, "application/zip", "private, no-store"));
  let index = 0;
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (index < tasks.length) {
      await tasks[index++]();
      if (index % 200 === 0) console.log(JSON.stringify({ uploaded: index, total: tasks.length }));
    }
  }));
  if (mode === "assets") {
    console.log(JSON.stringify({ refreshedStaticFiles: tasks.length, release }));
    process.exit(0);
  }
  catalog.release = release;
  catalog.publishedAt = new Date().toISOString();
  for (const entry of catalog.entries) entry.archiveBytes = archiveIndex ? archiveIndex.archives[entry.archive] : (await fs.stat(path.join("crafto-archives", `${entry.archive}.zip`))).size;
  const collection = pack === "canvas" ? "forgeia-2" : "forgeia-1";
  let previous;
  try {
    const current = await client.send(new GetObjectCommand({ Bucket: bucket, Key: "website-examples/catalog/current.json" }));
    previous = JSON.parse(await current.Body.transformToString());
  } catch (error) { if (error.name !== "NoSuchKey") throw error; }
  if (previous) await client.send(new PutObjectCommand({ Bucket: bucket, Key: `website-examples/catalog/history/${Date.now()}-${collection}.json`, Body: JSON.stringify(previous), ContentType: "application/json" }));
  const combined = mergeCatalogs(catalog, previous, release, collection);
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: "website-examples/catalog/current.json", Body: JSON.stringify(combined), ContentType: "application/json", CacheControl: "no-store" }));
  console.log(JSON.stringify({ published: tasks.length, pages: catalog.total, sites: catalog.sites, archives: archiveIndex ? Object.keys(archiveIndex.archives).length : archiveFiles.length, release, combinedPages: combined.total, combinedSites: combined.sites }));
} else throw new Error("Invalid mode");
