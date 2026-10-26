export function mergeCatalogs(catalog, previous, release, collection) {
  const retained = (previous?.entries || [])
    .filter((entry) => (entry.collection || "forgeia-1") !== collection)
    .map((entry) => ({ ...entry, release: entry.release || previous.release, collection: entry.collection || "forgeia-1" }));
  const entries = [...catalog.entries.map((entry) => ({ ...entry, release, collection })), ...retained];
  if (new Set(entries.map((entry) => entry.id)).size !== entries.length || entries.length > 5000) {
    throw new Error("Catalog entry collision or size limit");
  }
  return { ...catalog, release, publishedAt: new Date().toISOString(), entries, total: entries.length,
    sites: entries.filter((entry) => entry.category === "sites").length };
}
