export interface FolderPage {
  files?: { id: string }[];
  nextPageToken?: string;
  incompleteSearch?: boolean;
}

export interface FolderScope {
  folderIds: string[];
  isComplete: boolean;
  error: string | null;
  generation: number;
}

/** Explore uniquement les descendants des racines autorisées, par lots courts. */
export function createDriveFolderScope(
  roots: string[],
  listFolders: (parents: string[], pageToken?: string) => Promise<FolderPage>,
  options: { cacheTtlMs?: number; maxPages?: number; batchSize?: number } = {},
) {
  let sequence = 0;
  let state: {
    ids: Set<string>; pending: string[]; parents: string[]; pageToken?: string;
    isComplete: boolean; error: string | null; updatedAt: number; generation: number;
  } | undefined;
  let inFlight: Promise<FolderScope> | undefined;

  async function advance(forceRefresh = false): Promise<FolderScope> {
    if (inFlight) return inFlight;
    if (state && (state.isComplete || state.error) && (forceRefresh || Date.now() - state.updatedAt >= (options.cacheTtlMs ?? 5 * 60_000))) {
      state = undefined;
    }
    const scan = state ??= {
      ids: new Set(roots), pending: [...roots], parents: [], isComplete: roots.length === 0,
      error: null, updatedAt: Date.now(), generation: ++sequence,
    };

    const snapshot = (): FolderScope => ({
      folderIds: [...scan.ids], isComplete: scan.isComplete,
      error: scan.error, generation: scan.generation,
    });
    if (scan.isComplete || scan.error) return snapshot();

    const batch = (async () => {
      const startedAt = Date.now();
      try {
        for (let page = 0; page < (options.maxPages ?? 3); page += 1) {
          if (!scan.parents.length) scan.parents = scan.pending.splice(0, options.batchSize ?? 40);
          const result = await listFolders(scan.parents, scan.pageToken);
          if (result.incompleteSearch) throw new Error("Google Drive n'a pas pu explorer tous les sous-dossiers. Relance la synchronisation.");
          if (result.nextPageToken && result.nextPageToken === scan.pageToken) {
            throw new Error("Pagination des sous-dossiers Google Drive invalide.");
          }
          for (const folder of result.files ?? []) {
            if (!scan.ids.has(folder.id)) {
              scan.ids.add(folder.id);
              scan.pending.push(folder.id);
            }
          }
          scan.pageToken = result.nextPageToken;
          if (!result.nextPageToken) scan.parents = [];
          scan.isComplete = !scan.parents.length && !scan.pending.length;
          scan.updatedAt = Date.now();
          if (scan.isComplete || Date.now() - startedAt >= 5_000) break;
        }
      } catch (error) {
        scan.error = error instanceof Error ? error.message : "Dossier Google Drive indisponible.";
        scan.updatedAt = Date.now();
      }
      return snapshot();
    })();
    inFlight = batch;
    try { return await batch; }
    finally { if (inFlight === batch) inFlight = undefined; }
  }

  return { advance, clear() { state = undefined; inFlight = undefined; } };
}

/** L'autorisation d'un dossier ne s'étend pas aux autres fichiers du même propriétaire. */
export async function isWithinDriveFolders(
  parents: string[], roots: string[], getParents: (folderId: string) => Promise<string[]>,
): Promise<boolean> {
  const allowed = new Set(roots);
  const visited = new Set<string>();
  const pending = [...parents];
  while (pending.length) {
    const id = pending.shift()!;
    if (allowed.has(id)) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    try { pending.push(...await getParents(id)); }
    catch { /* Une branche inaccessible ne donne aucun droit supplémentaire. */ }
  }
  return false;
}
