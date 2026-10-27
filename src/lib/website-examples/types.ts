import { calculateFileCoinsCost } from "@/lib/wallet/pricing";
import { exampleUnlockId } from "./purchases";

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
  release?: string;
  collection?: string;
};

export type ExamplesCatalog = {
  version: 1;
  release: string;
  publishedAt: string;
  sites: number;
  total: number;
  entries: WebsiteExample[];
};

export type PublicExample = Omit<WebsiteExample, "page" | "archive" | "thumbnail" | "release"> & {
  previewUrl: string;
  thumbnailUrl: string;
  collection: string;
  unlockId: string;
  coinsCost: number;
};

const identifier = /^[a-z0-9][a-z0-9-]{0,100}$/;
const releaseName = /^[a-z0-9][a-z0-9-]{0,59}$/;
const pageName = /^[a-z0-9][a-z0-9_-]{0,150}\.html$/;
const isIdentifier = (value: unknown): value is string => typeof value === "string" && identifier.test(value);

export function parseCatalog(input: unknown): ExamplesCatalog {
  const value = input as ExamplesCatalog;
  if (!value || value.version !== 1 || typeof value.release !== "string" || !releaseName.test(value.release) || !Array.isArray(value.entries)
    || value.entries.length < 1 || value.entries.length > 5000) throw new Error("Invalid examples catalog");
  const ids = new Set<string>();
  for (const entry of value.entries) {
    if (!entry || !isIdentifier(entry.id) || !isIdentifier(entry.archive)
      || typeof entry.page !== "string" || !pageName.test(entry.page) || entry.thumbnail !== `thumbnails/${entry.id}.jpg`
      || typeof entry.title !== "string" || entry.title.length > 200
      || typeof entry.family !== "string" || !["sites", "pages", "components"].includes(entry.category)
      || !Number.isSafeInteger(entry.pageCount) || entry.pageCount < 1
      || !Number.isSafeInteger(entry.archiveBytes) || entry.archiveBytes < 1 || ids.has(entry.id)
      || (entry.release !== undefined && (typeof entry.release !== "string" || !releaseName.test(entry.release)))
      || (entry.collection !== undefined && !isIdentifier(entry.collection))) {
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
  return catalog.entries.map(({ page, archive, thumbnail, release, ...entry }) => ({
    ...entry,
    collection: entry.collection || "forgeia-1",
    unlockId: exampleUnlockId({ ...entry, archive }),
    coinsCost: calculateFileCoinsCost(entry.archiveBytes),
    previewUrl: `${baseUrl}/${release || catalog.release}/${page}`,
    thumbnailUrl: `${baseUrl}/${release || catalog.release}/${thumbnail}`,
  }));
}
