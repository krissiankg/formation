import fs from "node:fs";
import path from "node:path";

export const GOOGLE_DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID || "1pPMsHu96fsTDiSV5EvRoSjP6fZr4UrOu";

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

// Cache en mémoire pour la liste des fichiers (5 minutes)
let filesCache: { items: DriveFileItem[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

  // Récupérer l'email connecté si possible
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
  // Réinitialise le cache pour forcer la relecture
  filesCache = null;

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

  // Si l'access token est encore valide, le réutiliser
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
 * Liste les fichiers contenus dans le dossier spécifique partagé (avec cache en mémoire)
 */
export async function listFolderFiles(forceRefresh = false): Promise<DriveFileItem[]> {
  const now = Date.now();
  if (!forceRefresh && filesCache && now - filesCache.timestamp < CACHE_TTL_MS) {
    return filesCache.items;
  }

  const accessToken = await getValidAccessToken();

  // Requête stricte : uniquement les fichiers ayant pour parent GOOGLE_DRIVE_FOLDER_ID
  const query = `'${GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed = false`;
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", query);
  url.searchParams.set("fields", "files(id, name, mimeType, size, modifiedTime, iconLink)");
  url.searchParams.set("supportsAllDrives", "true");
  url.searchParams.set("includeItemsFromAllDrives", "true");
  url.searchParams.set("pageSize", "1000");

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

  // Mettre en cache
  filesCache = {
    items,
    timestamp: now,
  };

  return items;
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
  // 1. Récupérer la liste des fichiers autorisés
  const files = await listFolderFiles();
  const targetFile = files.find((f) => f.id === fileId);

  // SÉCURITÉ ABSOLUE : Si le fileId n'est pas dans le dossier ciblé, refuser net !
  if (!targetFile) {
    throw new Error("Accès refusé : fichier introuvable dans le dossier partagé autorisé.");
  }

  const accessToken = await getValidAccessToken();

  // Télécharger le média brut
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
    (targetFile.name.endsWith(".zip") ? "application/zip" : "application/octet-stream");
  const contentLength = response.headers.get("content-length") || targetFile.size;

  return {
    stream: response.body,
    file: targetFile,
    contentType,
    contentLength: contentLength || undefined,
  };
}
