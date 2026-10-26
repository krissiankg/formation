// GitHub Actions uses its existing OIDC role; no production secret is read.
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
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

if (mode === "prepare") {
  const bytes = Number(process.env.BUNDLE_BYTES);
  if (!Number.isSafeInteger(bytes) || bytes <= 0 || bytes > 200_000_000) throw new Error("Invalid bundle size");
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
  const body = await response.Body.transformToByteArray();
  if (createHash("sha256").update(body).digest("hex") !== checksum) throw new Error("Bundle checksum mismatch");
  await fs.writeFile("crafto.zip", body);
  console.log(`Verified source bundle: ${body.length} bytes`);
} else if (mode === "publish" || mode === "assets") {
  const build = path.resolve("crafto-build");
  const catalog = JSON.parse(await fs.readFile(path.join(build, "catalog.json"), "utf8"));
  for (const entry of mode === "publish" ? catalog.entries : []) {
    if ((await fs.stat(path.join(build, entry.thumbnail))).size < 500) throw new Error(`Missing thumbnail: ${entry.id}`);
    await fs.access(path.join(build, "html", entry.page));
    await fs.access(path.join("crafto-archives", `${entry.archive}.zip`));
  }
  const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "application/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".cur": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".eot": "application/vnd.ms-fontobject", ".mp4": "video/mp4" };
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
      if (!types[ext] || /(?:^|[/\\])(?:sass|email-templates)(?:[/\\])/.test(file)) continue;
      const relative = path.relative(path.join(build, folder), file).replaceAll("\\", "/");
      const objectKey = `website-examples/previews/${release}/${folder === "thumbnails" ? "thumbnails/" : ""}${relative}`;
      tasks.push(() => put(file, objectKey, types[ext]));
    }
  }
  const archiveFiles = mode === "publish" ? await walk("crafto-archives") : [];
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
  for (const entry of catalog.entries) entry.archiveBytes = (await fs.stat(path.join("crafto-archives", `${entry.archive}.zip`))).size;
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: "website-examples/catalog/current.json", Body: JSON.stringify(catalog), ContentType: "application/json", CacheControl: "no-store" }));
  console.log(JSON.stringify({ published: tasks.length, pages: catalog.total, sites: catalog.sites, archives: archiveFiles.length, release }));
} else throw new Error("Invalid mode");
