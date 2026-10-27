import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getExamplesViewer } from "./access";
import { parseCatalog, type ExamplesCatalog, type WebsiteExample } from "./types";

let client: S3Client | undefined;
let cached: { catalog: ExamplesCatalog; expires: number } | undefined;

function s3() {
  return client ??= new S3Client({ region: process.env.AWS_REGION || "eu-west-3" });
}

export async function canAccessExamples() {
  return Boolean(await getExamplesViewer());
}

export async function getExamplesCatalog(): Promise<ExamplesCatalog> {
  if (cached && cached.expires > Date.now()) return cached.catalog;
  const bucket = process.env.UPLOADS_BUCKET;
  if (!bucket) throw new Error("Examples storage unavailable");
  const response = await s3().send(new GetObjectCommand({ Bucket: bucket, Key: "website-examples/catalog/current.json" }));
  if (!response.Body) throw new Error("Examples catalog unavailable");
  const catalog = parseCatalog(JSON.parse(await response.Body.transformToString()));
  cached = { catalog, expires: Date.now() + 60_000 };
  return catalog;
}

export function signExampleDownload(catalog: ExamplesCatalog, entry: WebsiteExample) {
  return getSignedUrl(s3(), new GetObjectCommand({
    Bucket: process.env.UPLOADS_BUCKET,
    Key: `website-examples/downloads/${entry.release || catalog.release}/${entry.archive}.zip`,
    ResponseContentType: "application/zip",
    ResponseContentDisposition: `attachment; filename="forgeia-${entry.archive}.zip"`,
  }), { expiresIn: 120 });
}
