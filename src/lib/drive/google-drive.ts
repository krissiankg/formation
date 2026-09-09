import fs from "node:fs";
import path from "node:path";

export const GOOGLE_DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID || "1pPMsHu96fsTDiSV5EvRoSjP6fZr4UrOu";

// Propriétaire de la collection partagée UI8 (garantit qu'aucun fichier personnel n'est exposé)
export const SHARED_COLLECTION_OWNER =
  process.env.GOOGLE_DRIVE_COLLECTION_OWNER || "contact_us@design-solutionz.co.nz";

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string; // bytes in string
  modifiedTime?: string;
  iconLink?: string;
}

interface StoredToken {
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number;
  connectedEmail?: string;
}

// Emplacement du fichier de persistance local pour le token
const TOKEN_FILE_PATH = path.join(process.cwd(), "data", "google-drive-token.json");

// Cache en mémoire pour l'access token
let memoryToken: StoredToken | null = null;

// Cache en mémoire pour les requêtes de recherche (1 minute)
const searchCache = new Map<string, { items: DriveFileItem[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000;

function getClientId(): string | undefined {
  return process.env.GOOGLE_CLIENT_ID;
}

function getClientSecret(): string | undefined {
  return process.env.GOOGLE_CLIENT_SECRET;
}

/**
 * Charge le token stocké (soit depuis les variables d'environnement, soit depuis le fichier data/google-drive-token.json)
 */
export function getStoredToken(): StoredToken | null {
  if (memoryToken?.refreshToken) {
    return memoryToken;
  }

  // 1. Depuis .env
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    memoryToken = {
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };
    return memoryToken;
  }

  // 2. Depuis le fichier data/google-drive-token.json
  try {
    if (fs.existsSync(TOKEN_FILE_PATH)) {
      const content = fs.readFileSync(TOKEN_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content) as StoredToken;
      if (parsed.refreshToken) {
        memoryToken = parsed;
        return memoryToken;
      }
    }
  } catch (err) {
    console.error("[Drive] Erreur lecture fichier token:", err);
  }

  return null;
}

/**
 * Sauvegarde le refresh token de manière persistante
 */
export function saveStoredToken(tokenData: StoredToken) {
  memoryToken = { ...tokenData };
  try {
    const dir = path.dirname(TOKEN_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokenData, null, 2), "utf-8");
  } catch (err) {
    console.error("[Drive] Erreur écriture fichier token:", err);
  }
}

/**
 * Vérifie si les identifiants requis sont présents et si un refresh token est enregistré
 */
export function isDriveConfigured(): boolean {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  const token = getStoredToken();
  return Boolean(clientId && clientSecret && token?.refreshToken);
}

/**
 * Génère l'URL d'autorisation Google OAuth 2.0
 */
export function getGoogleOAuthUrl(redirectUri: string): string {
  const clientId = getClientId();
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID non configuré");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Échange le code d'autorisation contre les tokens OAuth
 */
export async function exchangeOAuthCode(code: string, redirectUri: string) {
  const clientId = getClientId();
  const clientSecret = getClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET manquant");
  }

  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await response.json();

  if (!response.ok || !data.refresh_token) {
    throw new Error(data.error_description || data.error || "Échec de récupération du token");
  }

  let connectedEmail: string | undefined;
  if (data.access_token) {
    try {
      const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (userInfoRes.ok) {
        const userInfo = await userInfoRes.json();
        connectedEmail = userInfo.email;
      }
    } catch {
      // ignore
    }
  }

  const stored: StoredToken = {
    refreshToken: data.refresh_token,
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000 - 60000,
    connectedEmail,
  };

  saveStoredToken(stored);
  searchCache.clear();

  return stored;
}

/**
 * Obtient un access_token valide (renouvelle automatiquement avec le refresh_token si expiré)
 */
export async function getValidAccessToken(): Promise<string> {
  const stored = getStoredToken();
  if (!stored?.refreshToken) {
    throw new Error("Google Drive n'est pas encore connecté. Veuillez lier votre compte dans l'administration.");
  }

  if (stored.accessToken && stored.expiresAt && stored.expiresAt > Date.now()) {
    return stored.accessToken;
  }

  const clientId = getClientId();
  const clientSecret = getClientSecret();

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET manquant");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: stored.refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Impossible de renouveler le token Google Drive");
  }

  stored.accessToken = data.access_token;
  stored.expiresAt = Date.now() + (data.expires_in || 3600) * 1000 - 60000;
  saveStoredToken(stored);

  return data.access_token;
}

/**
 * Recherche récursive et globale de fichiers dans la collection partagée UI8
 */
export async function searchDriveFiles(options?: {
  query?: string;
  pageSize?: number;
}): Promise<DriveFileItem[]> {
  const search = (options?.query ?? "").trim();
  const pageSize = options?.pageSize || 100;
  const cacheKey = `${search.toLowerCase()}_${pageSize}`;
  const now = Date.now();

  const cached = searchCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.items;
  }

  const accessToken = await getValidAccessToken();

  // Requête stricte : uniquement les fichiers appartenant à la collection partagée (contact_us@design-solutionz.co.nz)
  // et ignorant les dossiers
  let q = `'${SHARED_COLLECTION_OWNER}' in owners and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;

  if (search) {
    const words = search
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2);

    for (const word of words) {
      const escaped = word.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      q += ` and name contains '${escaped}'`;
    }
  }

  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", q);
  url.searchParams.set("fields", "files(id, name, mimeType, size, modifiedTime, iconLink)");
  url.searchParams.set("orderBy", "modifiedTime desc");
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("supportsAllDrives", "true");
  url.searchParams.set("includeItemsFromAllDrives", "true");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Erreur API Google Drive: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as { files?: DriveFileItem[] };
  const items = data.files || [];

  searchCache.set(cacheKey, { items, timestamp: now });
  return items;
}

/**
 * Pour compatibilité avec l'existant
 */
export async function listFolderFiles(forceRefresh = false): Promise<DriveFileItem[]> {
  if (forceRefresh) searchCache.clear();
  return searchDriveFiles({ pageSize: 50 });
}

/**
 * Vérifie la légitimité d'un fichier et prépare son téléchargement en streaming
 */
export async function getFileDownloadStream(fileId: string): Promise<{
  stream: ReadableStream<Uint8Array>;
  file: DriveFileItem;
  contentType: string;
  contentLength?: string;
}> {
  const accessToken = await getValidAccessToken();

  // 1. Récupérer les métadonnées pour vérifier l'appartenance à la collection autorisée
  const metaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,owners&supportsAllDrives=true`;
  const metaRes = await fetch(metaUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!metaRes.ok) {
    throw new Error("Fichier introuvable sur Google Drive.");
  }

  const fileMeta = (await metaRes.json()) as {
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    owners?: Array<{ emailAddress?: string }>;
  };

  // Sécurité absolue : s'assurer que le fichier appartient bien à la collection autorisée
  const isOwnerValid = fileMeta.owners?.some(
    (o) => o.emailAddress === SHARED_COLLECTION_OWNER
  );

  if (!isOwnerValid) {
    throw new Error("Accès refusé : ce fichier n'appartient pas à la collection autorisée.");
  }

  // 2. Télécharger le flux binaire brut
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
  const response = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok || !response.body) {
    throw new Error(`Erreur lors du téléchargement Google Drive (${response.status})`);
  }

  const contentType =
    response.headers.get("content-type") ||
    (fileMeta.name.endsWith(".zip") ? "application/zip" : "application/octet-stream");
  const contentLength = response.headers.get("content-length") || fileMeta.size;

  return {
    stream: response.body,
    file: fileMeta,
    contentType,
    contentLength: contentLength || undefined,
  };
}
