import type { ContentAttachment } from "@/lib/store/content";

type OnProgress = (percent: number) => void;

/**
 * Téléverse un fichier depuis l'admin : directement vers S3 (URL pré-signée) en production,
 * ou via le serveur Next.js en développement local. Retourne la pièce jointe (url publique comprise).
 */
export async function uploadFile(file: File, onProgress?: OnProgress): Promise<ContentAttachment> {
  const res = await fetch("/api/admin/content/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Erreur HTTP ${res.status}`);
  }
  if (data.mode === "s3") {
    return uploadToS3(file, data.uploadUrl, data.attachment, onProgress);
  }
  return uploadToServer(file, onProgress);
}

function trackProgress(xhr: XMLHttpRequest, onProgress?: OnProgress) {
  xhr.upload.onprogress = (event) => {
    if (onProgress && event.lengthComputable) {
      onProgress(Math.round((event.loaded / event.total) * 100));
    }
  };
}

// Envoi direct navigateur → S3 (production AWS)
function uploadToS3(
  file: File,
  uploadUrl: string,
  attachment: ContentAttachment,
  onProgress?: OnProgress,
): Promise<ContentAttachment> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    trackProgress(xhr, onProgress);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(attachment);
      else reject(new Error(`Erreur stockage ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant le téléversement"));
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", attachment.type || "application/octet-stream");
    xhr.send(file);
  });
}

// Envoi via le serveur Next.js (développement local, sans S3)
function uploadToServer(file: File, onProgress?: OnProgress): Promise<ContentAttachment> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    trackProgress(xhr, onProgress);
    xhr.onload = () => {
      let res: { error?: string } & Partial<ContentAttachment> = {};
      try {
        res = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error(xhr.status >= 200 && xhr.status < 300 ? "Réponse serveur invalide" : `Erreur HTTP ${xhr.status}`));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && !res.error) resolve(res as ContentAttachment);
      else reject(new Error(res.error || `Erreur HTTP ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant le téléversement"));
    xhr.open("POST", "/api/admin/content/upload");
    xhr.send(formData);
  });
}
