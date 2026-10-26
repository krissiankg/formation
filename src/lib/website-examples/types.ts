export type WebsiteExample = {
  id: string;
  title: string;
  category: "sites" | "pages" | "components";
  family: string;
  page: string;
  archive: string;
  thumbnail: string;
  pageCount: number;
  archiveBytes: number;
};

export type ExamplesCatalog = {
  version: 1;
  release: string;
  publishedAt: string;
  sites: number;
  total: number;
  entries: WebsiteExample[];
};

export type PublicExample = Omit<WebsiteExample, "page" | "archive" | "thumbnail"> & {
  previewUrl: string;
  thumbnailUrl: string;
};

const identifier = /^[a-z0-9][a-z0-9-]{0,100}$/;

export function parseCatalog(input: unknown): ExamplesCatalog {
  const value = input as ExamplesCatalog;
  if (!value || value.version !== 1 || !identifier.test(value.release) || !Array.isArray(value.entries)
    || value.entries.length < 1 || value.entries.length > 2000) throw new Error("Invalid examples catalog");
  const ids = new Set<string>();
  for (const entry of value.entries) {
    if (!entry || !identifier.test(entry.id) || !identifier.test(entry.archive)
      || entry.page !== `${entry.id}.html` || entry.thumbnail !== `thumbnails/${entry.id}.jpg`
      || typeof entry.title !== "string" || entry.title.length > 200
      || typeof entry.family !== "string" || !["sites", "pages", "components"].includes(entry.category)
      || !Number.isSafeInteger(entry.pageCount) || entry.pageCount < 1
      || !Number.isSafeInteger(entry.archiveBytes) || entry.archiveBytes < 1 || ids.has(entry.id)) {
      throw new Error("Invalid example entry");
    }
    ids.add(entry.id);
  }
  if (value.total !== value.entries.length || value.sites !== value.entries.filter((e) => e.category === "sites").length) {
    throw new Error("Incomplete examples catalog");
  }
  return value;
}

export function publicCatalog(catalog: ExamplesCatalog, baseUrl: string): PublicExample[] {
  if (!/^https:\/\/[a-z0-9]+\.cloudfront\.net$/.test(baseUrl)) throw new Error("Invalid examples origin");
  return catalog.entries.map(({ page, archive: _archive, thumbnail, ...entry }) => ({
    ...entry,
    previewUrl: `${baseUrl}/${catalog.release}/${page}`,
    thumbnailUrl: `${baseUrl}/${catalog.release}/${thumbnail}`,
  }));
}
