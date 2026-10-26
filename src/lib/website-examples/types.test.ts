import { describe, expect, it } from "vitest";
import { parseCatalog, publicCatalog } from "./types";

const fixture = () => ({ version: 1, release: "crafto-v1", publishedAt: "2026-10-26", sites: 1, total: 1,
  entries: [{ id: "demo-accounting", title: "Accounting", category: "sites", family: "accounting", page: "demo-accounting.html", archive: "accounting", thumbnail: "thumbnails/demo-accounting.jpg", pageCount: 8, archiveBytes: 1000 }] });

describe("website examples catalog", () => {
  it("derives public preview URLs without exposing private archive keys", () => {
    const entries = publicCatalog(parseCatalog(fixture()), "https://d123.cloudfront.net");
    expect(entries[0].previewUrl).toBe("https://d123.cloudfront.net/crafto-v1/demo-accounting.html");
    expect(entries[0]).not.toHaveProperty("archive");
    expect(() => publicCatalog(parseCatalog(fixture()), "https://www.forgeia.site")).toThrow();
  });
  it.each(["../private", "a/b", "name.zip", "https://elsewhere"]) ("rejects an unsafe archive: %s", (archive) => {
    const input = fixture(); input.entries[0].archive = archive;
    expect(() => parseCatalog(input)).toThrow();
  });
  it("rejects duplicate and partial releases", () => {
    const duplicate = fixture(); duplicate.entries.push(duplicate.entries[0]);
    expect(() => parseCatalog(duplicate)).toThrow();
    expect(() => parseCatalog({ ...fixture(), total: 50 })).toThrow();
  });
});
