import fs from "node:fs";
import path from "node:path";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { createDriveFileCounter, type DriveCountPage } from "@/lib/drive/file-count";
import { createDriveFolderScope, isWithinDriveFolders, type FolderScope } from "@/lib/drive/folder-scope";
import { driveResourceKindFilter, type DriveResourceKind } from "@/lib/drive/resource-kind";

export const GOOGLE_DRIVE_FOLDER_ID =
  process.env.GOOGLE_DRIVE_FOLDER_ID || "1pPMsHu96fsTDiSV5EvRoSjP6fZr4UrOu";

export const ADDITIONAL_DRIVE_FOLDER_ID = "1z5GK_fjOlFbDd4YoycLzjBs17xsRT30f";
export const GOOGLE_DRIVE_FOLDERS = [
  { id: GOOGLE_DRIVE_FOLDER_ID, name: "Collection principale" },
  { id: ADDITIONAL_DRIVE_FOLDER_ID, name: "Dossier supplémentaire" },
];
let additionalFolderName = "Dossier supplémentaire";

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

const SETTINGS_KEY = "google_drive_token";

async function readTokenFromDb(): Promise<StoredToken | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("app_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();
    if (error) {
      console.error("[Drive] Erreur lecture jeton en base:", error.message);
      return null;
    }
    const value = data?.value as StoredToken | undefined;
    return value?.refreshToken ? value : null;
  } catch (err) {
    console.error("[Drive] Erreur lecture jeton en base:", err);
    return null;
  }
}

async function writeTokenToDb(tokenData: StoredToken): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const { error } = await getSupabaseAdmin()
      .from("app_settings")
      .upsert({ key: SETTINGS_KEY, value: tokenData, updated_at: new Date().toISOString() });
    if (error) {
      console.error("[Drive] Erreur écriture jeton en base:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Drive] Erreur écriture jeton en base:", err);
    return false;
  }
}

/**
 * Charge le token stocké : mémoire, puis base (app_settings, survit aux redéploiements),
 * puis variable d'environnement, puis fichier data/google-drive-token.json.
 */
export async function getStoredToken(): Promise<StoredToken | null> {
  if (memoryToken?.refreshToken) {
    return memoryToken;
  }

  // 1. Depuis la base
  const dbToken = await readTokenFromDb();
  if (dbToken) {
    memoryToken = dbToken;
    return memoryToken;
  }

  // 2. Depuis .env
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    memoryToken = {
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };
    return memoryToken;
  }

  // 3. Depuis le fichier data/google-drive-token.json
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
 * Sauvegarde le refresh token de manière persistante (base, et fichier local en secours)
 */
export async function saveStoredToken(tokenData: StoredToken) {
  memoryToken = { ...tokenData };
  if (await writeTokenToDb(tokenData)) {
    return;
  }
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
export async function isDriveConfigured(): Promise<boolean> {
  const clientId = getClientId();
  const clientSecret = getClientSecret();
  const token = await getStoredToken();
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

  await saveStoredToken(stored);
  searchCache.clear();
  additionalFolderScope.clear();
  catalogCount = undefined;

  return stored;
}

/**
 * Obtient un access_token valide (renouvelle automatiquement avec le refresh_token si expiré)
 */
export async function getValidAccessToken(): Promise<string> {
  const stored = await getStoredToken();
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
  await saveStoredToken(stored);

  return data.access_token;
}

function collectionQuery(search = "", scope = `'${SHARED_COLLECTION_OWNER}' in owners`): string {
  // Requête stricte : uniquement les fichiers appartenant à la collection partagée (contact_us@design-solutionz.co.nz)
  // et ignorant les dossiers
  let q = `${scope} and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;

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

  return q;
}

/**
 * Recherche récursive et globale de fichiers dans la collection partagée UI8
 */
export async function searchDriveCatalog(options?: {
  query?: string;
  pageSize?: number;
  kind?: DriveResourceKind;
}): Promise<{ files: DriveFileItem[]; isIndexing: boolean; warning: string | null }> {
  const search = (options?.query ?? "").trim();
  const pageSize = options?.pageSize || 100;
  const kind = options?.kind ?? "all";
  const scope = await additionalFolderScope.advance();
  const isIndexing = !scope.isComplete && !scope.error;
  const cacheKey = `${scope.generation}_${kind}_${search.toLowerCase()}_${pageSize}`;
  const now = Date.now();

  const cached = searchCache.get(cacheKey);
  if (!isIndexing && !scope.error && cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { files: cached.items, isIndexing: false, warning: null };
  }

  const kindFilter = driveResourceKindFilter(kind);
  const queries = catalogQueries(scope, search).map((q) => kindFilter ? `${q} and (${kindFilter})` : q);
  const unique = new Map<string, DriveFileItem>();
  for (let offset = 0; offset < queries.length; offset += 3) {
    const pages = await Promise.all(queries.slice(offset, offset + 3).map((q) => listDrivePage<DriveFileItem>({
      q, pageSize, fields: "files(id,name,mimeType,size,modifiedTime,iconLink)", orderBy: "modifiedTime desc",
    })));
    for (const page of pages) for (const file of page.files ?? []) unique.set(file.id, file);
  }
  const items = [...unique.values()]
    .sort((a, b) => (b.modifiedTime ?? "").localeCompare(a.modifiedTime ?? ""))
    .slice(0, pageSize);
  if (!isIndexing && !scope.error) searchCache.set(cacheKey, { items, timestamp: now });
  return { files: items, isIndexing, warning: scope.error };
}

export async function searchDriveFiles(options?: { query?: string; pageSize?: number }) {
  return (await searchDriveCatalog(options)).files;
}

async function listDrivePage<T>(options: {
  q: string; fields: string; pageSize?: number; pageToken?: string; orderBy?: string;
}): Promise<{ files?: T[]; nextPageToken?: string; incompleteSearch?: boolean }> {
  const accessToken = await getValidAccessToken();
  const url = new URL("https://www.googleapis.com/drive/v3/files");
  url.searchParams.set("q", options.q);
  url.searchParams.set("fields", options.fields);
  url.searchParams.set("pageSize", String(options.pageSize ?? 1000));
  url.searchParams.set("supportsAllDrives", "true");
  url.searchParams.set("includeItemsFromAllDrives", "true");
  if (options.pageToken) url.searchParams.set("pageToken", options.pageToken);
  if (options.orderBy) url.searchParams.set("orderBy", options.orderBy);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Erreur API Google Drive : ${response.status}`);
  }
  return response.json();
}

async function getDriveMetadata<T>(fileId: string, fields: string): Promise<T> {
  const accessToken = await getValidAccessToken();
  const url = new URL(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("supportsAllDrives", "true");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Ce dossier ou fichier n'est pas accessible au compte Google connecté.");
  return response.json();
}

const additionalFolderScope = createDriveFolderScope([ADDITIONAL_DRIVE_FOLDER_ID], async (parents, pageToken) => {
  if (parents.includes(ADDITIONAL_DRIVE_FOLDER_ID) && !pageToken) {
    const root = await getDriveMetadata<{ name: string; mimeType: string; trashed?: boolean }>(
      ADDITIONAL_DRIVE_FOLDER_ID, "name,mimeType,trashed",
    );
    if (root.trashed || root.mimeType !== "application/vnd.google-apps.folder") {
      throw new Error("Le dossier supplémentaire n'est pas un dossier Google Drive actif.");
    }
    additionalFolderName = root.name;
  }
  return listDrivePage<{ id: string }>({
    q: `(${parents.map((id) => `'${id}' in parents`).join(" or ")}) and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id),nextPageToken,incompleteSearch", pageToken,
  });
});

function catalogQueries(scope: FolderScope, search = ""): string[] {
  const queries = [collectionQuery(search)];
  if (scope.error) return queries;
  for (let offset = 0; offset < scope.folderIds.length; offset += 40) {
    const parents = scope.folderIds.slice(offset, offset + 40).map((id) => `'${id}' in parents`).join(" or ");
    // Les fichiers déjà présents dans la première collection ne sont comptés qu'une seule fois.
    queries.push(collectionQuery(search, `((${parents}) and not ('${SHARED_COLLECTION_OWNER}' in owners))`));
  }
  return queries;
}

function catalogFolders() {
  return [GOOGLE_DRIVE_FOLDERS[0], { id: ADDITIONAL_DRIVE_FOLDER_ID, name: additionalFolderName }];
}

interface CatalogCountSession {
  generation: number;
  scope: FolderScope;
  counter: ReturnType<typeof createDriveFileCounter>;
  finished: boolean;
}
let catalogCount: CatalogCountSession | undefined;

async function readCatalogCount(session: CatalogCountSession, forceRefresh = false) {
  try {
    const result = await session.counter.count(forceRefresh);
    session.finished = result.isComplete;
    return {
      ...result, incompleteSearch: result.incompleteSearch || Boolean(session.scope.error),
      folders: catalogFolders(), warning: session.scope.error,
    };
  } catch (error) {
    session.finished = true;
    throw error;
  }
}

export async function countDriveFiles(forceRefresh = false) {
  if (catalogCount && !catalogCount.finished) return readCatalogCount(catalogCount);
  const scope = await additionalFolderScope.advance(forceRefresh);
  if (!scope.isComplete && !scope.error) {
    return { count: 0, isComplete: false, incompleteSearch: false, folders: catalogFolders(), warning: null };
  }
  if (!catalogCount || catalogCount.generation !== scope.generation) {
    const queries = catalogQueries(scope);
    catalogCount = {
      generation: scope.generation, scope, finished: false,
      counter: createDriveFileCounter(async (cursor): Promise<DriveCountPage> => {
        const { index, token } = cursor ? JSON.parse(cursor) as { index: number; token?: string } : { index: 0, token: undefined };
        const page = await listDrivePage<{ id: string }>({
          q: queries[index], fields: "nextPageToken,incompleteSearch,files(id)", pageToken: token,
        });
        const nextIndex = page.nextPageToken ? index : index + 1;
        return {
          ...page,
          nextPageToken: nextIndex < queries.length
            ? JSON.stringify({ index: nextIndex, ...(page.nextPageToken ? { token: page.nextPageToken } : {}) })
            : undefined,
        };
      }),
    };
  }
  return readCatalogCount(catalogCount, forceRefresh);
}

/** Métadonnées et appartenance à la collection, avant tout achat ou téléchargement. */
export async function getFileDownloadMetadata(fileId: string): Promise<DriveFileItem> {
  // 1. Récupérer les métadonnées pour vérifier l'appartenance à la collection autorisée
  const fileMeta = await getDriveMetadata<{
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    owners?: Array<{ emailAddress?: string }>;
    parents?: string[];
    trashed?: boolean;
  }>(fileId, "id,name,mimeType,size,owners,parents,trashed");

  // Sécurité absolue : s'assurer que le fichier appartient bien à la collection autorisée
  const isOwnerValid = fileMeta.owners?.some(
    (o) => o.emailAddress === SHARED_COLLECTION_OWNER
  );

  const isInAdditionalFolder = !isOwnerValid && await isWithinDriveFolders(
    fileMeta.parents ?? [], [ADDITIONAL_DRIVE_FOLDER_ID], async (id) => {
      const folder = await getDriveMetadata<{ parents?: string[]; trashed?: boolean }>(id, "parents,trashed");
      return folder.trashed ? [] : folder.parents ?? [];
    },
  );
  if (fileMeta.trashed || (!isOwnerValid && !isInAdditionalFolder)) {
    throw new Error("Accès refusé : ce fichier n'appartient pas à la collection autorisée.");
  }

  return fileMeta;
}

export async function getFileDownloadStream(fileId: string): Promise<{
  stream: ReadableStream<Uint8Array>;
  file: DriveFileItem;
  contentType: string;
  contentLength?: string;
}> {
  const fileMeta = await getFileDownloadMetadata(fileId);

  // 2. Télécharger le flux binaire brut
  const accessToken = await getValidAccessToken();
  const downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`;
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
