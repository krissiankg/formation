import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import { generateKeyPairSync, privateDecrypt, createDecipheriv } from "node:crypto";
import https from "node:https";
import path from "node:path";

const [mode, directory, bundle, encryptedFile] = process.argv.slice(2);
if (mode === "key") {
  const keys = generateKeyPairSync("rsa", { modulusLength: 3072, publicKeyEncoding: { type: "spki", format: "pem" }, privateKeyEncoding: { type: "pkcs8", format: "pem" } });
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, "upload-private.pem"), keys.privateKey, { mode: 0o600, flag: "wx" });
  await fs.writeFile(path.join(directory, "upload-public.txt"), Buffer.from(keys.publicKey).toString("base64"), { flag: "wx" });
  console.log("Upload key pair created locally.");
} else if (mode === "put") {
  const data = JSON.parse(await fs.readFile(encryptedFile, "utf8"));
  const secret = await fs.readFile(path.join(directory, "upload-private.pem"), "utf8");
  const key = privateDecrypt({ key: secret, oaepHash: "sha256" }, Buffer.from(data.key, "base64"));
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(data.iv, "base64"));
  decipher.setAuthTag(Buffer.from(data.tag, "base64"));
  const target = JSON.parse(Buffer.concat([decipher.update(Buffer.from(data.ciphertext, "base64")), decipher.final()]).toString("utf8"));
  const url = new URL(target.url);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".amazonaws.com")) throw new Error("Unexpected upload host");
  await new Promise((resolve, reject) => {
    const request = https.request(url, { method: "PUT", headers: target.headers }, (response) => {
      response.resume();
      response.on("end", () => response.statusCode >= 200 && response.statusCode < 300 ? resolve() : reject(new Error(`Upload HTTP ${response.statusCode}`)));
    });
    request.on("error", () => reject(new Error("Upload connection failed")));
    let bytes = 0;
    let next = 64 * 1024 * 1024;
    const input = createReadStream(bundle, { highWaterMark: 8 * 1024 * 1024 });
    input.on("data", (chunk) => { bytes += chunk.length; if (bytes >= next) { console.log(JSON.stringify({ uploadedBytes: bytes })); next += 64 * 1024 * 1024; } });
    input.on("error", (error) => { request.destroy(); reject(error); }).pipe(request);
  });
  console.log(`Uploaded ${(await fs.stat(bundle)).size} bytes successfully.`);
} else throw new Error("Expected key or put");
