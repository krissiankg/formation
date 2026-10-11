import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({ region: process.env.AWS_REGION || "eu-west-3" });
  }
  return client;
}

/** Vrai quand le stockage S3 est configuré (production AWS) ; sinon upload sur disque local. */
export function isS3UploadEnabled(): boolean {
  return Boolean(process.env.UPLOADS_BUCKET);
}

/**
 * URL PUT pré-signée (1 h) pour envoyer le fichier directement du navigateur vers S3.
 * La clé "uploads/resources/<fileName>" est servie par CloudFront sur "/uploads/resources/<fileName>".
 */
export async function createResourceUploadUrl(fileName: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.UPLOADS_BUCKET,
    Key: `uploads/resources/${fileName}`,
    ContentType: contentType,
  });
  return getSignedUrl(getClient(), command, { expiresIn: 3600 });
}
