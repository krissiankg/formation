import { describe, expect, it } from "vitest";
import { parseCatalog, publicCatalog } from "./types";

const fixture = () => ({ version: 1, release: "crafto-v1", publishedAt: "2026-10-26", sites: 1, total: 1,
  entries: [{ id: "demo-accounting", title: "Accounting", category: "sites", family: "accounting", page: "demo-accounting.html", archive: "accounting", thumbnail: "thumbnails/demo-accounting.jpg", pageCount: 8, archiveBytes: 1000 }] });

describe("website examples catalog", () => {
  it("derives public preview URLs without exposing private archive keys", () => {
    const entries = publicCatalog(parseCatalog(fixture()), "https://d123.cloudfront.net");
    expect(entries[0].previewUrl).toBe("https://d123.cloudfront.net/crafto-v1/demo-accounting.html");
    expect(entries[0]).not.toHaveProperty("archive");
    expect(entries[0].unlockId).toBe("html:forgeia-1:accounting");
    expect(entries[0].coinsCost).toBe(10);
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
  it("keeps preview and download releases separate for combined collections", () => {
    const data = fixture();
    const second = { ...data.entries[0], id: "f2-demo-accounting", thumbnail: "thumbnails/f2-demo-accounting.jpg", release: "forgeia-collection-2-v1", collection: "forgeia-2" };
    const catalog = parseCatalog({ ...data, sites: 2, total: 2, entries: [...data.entries, second] });
    const entries = publicCatalog(catalog, "https://d123.cloudfront.net");
    expect(entries[0].previewUrl).toContain("/crafto-v1/");
    expect(entries[1].previewUrl).toBe("https://d123.cloudfront.net/forgeia-collection-2-v1/demo-accounting.html");
    expect(entries[1].collection).toBe("forgeia-2");
    expect(entries[1]).not.toHaveProperty("release");
    expect(() => parseCatalog({ ...catalog, entries: [data.entries[0], { ...second, release: "../private" }] })).toThrow();
  });
  it("accepts the combined collection size with unique safe identifiers", () => {
    const data = fixture();
    const entries = Array.from({ length: 2013 }, (_, i) => ({ ...data.entries[0], id: `example-${i}`, thumbnail: `thumbnails/example-${i}.jpg` }));
    expect(parseCatalog({ ...data, sites: entries.length, total: entries.length, entries }).total).toBe(2013);
  });
});
