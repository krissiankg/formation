export interface DriveCountPage {
  files?: { id: string }[];
  nextPageToken?: string;
  incompleteSearch?: boolean;
}

export interface DriveFileCount {
  count: number;
  isComplete: boolean;
  incompleteSearch: boolean;
}

interface CountState extends DriveFileCount {
  pageToken?: string;
  updatedAt: number;
}

/** Compte par petits lots pour pouvoir poursuivre les grandes collections entre deux requêtes. */
export function createDriveFileCounter(
  listPage: (pageToken?: string) => Promise<DriveCountPage>,
  options: { maxPages?: number; maxDurationMs?: number; cacheTtlMs?: number } = {},
) {
  const maxPages = options.maxPages ?? 3;
  const maxDurationMs = options.maxDurationMs ?? 5_000;
  const cacheTtlMs = options.cacheTtlMs ?? 5 * 60_000;
  let state: CountState | undefined;
  let inFlight: Promise<DriveFileCount> | undefined;

  function snapshot(scan: CountState): DriveFileCount {
    return {
      count: scan.count,
      isComplete: scan.isComplete,
      incompleteSearch: scan.incompleteSearch,
    };
  }

  async function count(forceRefresh = false): Promise<DriveFileCount> {
    if (inFlight) return inFlight;

    if (state?.isComplete && (forceRefresh || Date.now() - state.updatedAt >= cacheTtlMs)) {
      state = undefined;
    }
    if (state?.isComplete) return snapshot(state);

    const scan = state ??= {
      count: 0,
      isComplete: false,
      incompleteSearch: false,
      updatedAt: Date.now(),
    };

    async function readBatch(): Promise<DriveFileCount> {
      const startedAt = Date.now();
      try {
        for (let page = 0; page < maxPages; page += 1) {
          const data = await listPage(scan.pageToken);
          if (data.nextPageToken && data.nextPageToken === scan.pageToken) {
            throw new Error("Google Drive a renvoyé une pagination invalide. Relance la synchronisation.");
          }
          scan.count += data.files?.length ?? 0;
          scan.incompleteSearch ||= Boolean(data.incompleteSearch);
          scan.pageToken = data.nextPageToken;
          scan.isComplete = !data.nextPageToken;
          scan.updatedAt = Date.now();

          if (scan.isComplete || Date.now() - startedAt >= maxDurationMs) break;
        }
        return snapshot(scan);
      } catch (error) {
        // Une page échouée ne doit jamais transformer un total partiel en total définitif.
        if (state === scan) state = undefined;
        throw error;
      }
    }

    const batch = readBatch();
    inFlight = batch;
    try {
      return await batch;
    } finally {
      if (inFlight === batch) inFlight = undefined;
    }
  }

  function clear() {
    state = undefined;
    inFlight = undefined;
  }

  return { count, clear };
}
