import test from "node:test";
import assert from "node:assert/strict";
import { mergeCatalogs } from "./catalog-merge.mjs";

test("adding a collection preserves the original download release and IDs", () => {
  const old = { release: "forgeia-sites-v2", entries: [{ id: "index", category: "sites" }] };
  const added = { entries: [{ id: "f2-index", category: "components" }] };
  const result = mergeCatalogs(added, old, "forgeia-collection-2-v1", "forgeia-2");
  assert.equal(result.total, 2);
  assert.equal(result.sites, 1);
  assert.equal(result.entries[1].release, old.release);
  assert.equal(result.entries[1].id, "index");
  assert.equal(result.entries[0].release, "forgeia-collection-2-v1");
  assert.equal(old.entries[0].collection, undefined);
});

test("republishing replaces only the selected collection", () => {
  const old = { release: "new-root", entries: [
    { id: "old-2", collection: "forgeia-2" },
    { id: "keep", collection: "forgeia-1", release: "original" },
  ] };
  const result = mergeCatalogs({ entries: [{ id: "new-2" }] }, old, "next", "forgeia-2");
  assert.deepEqual(result.entries.map((entry) => entry.id), ["new-2", "keep"]);
  assert.equal(result.entries[1].release, "original");
});

test("identifier collisions cannot replace the active catalog", () => {
  assert.throws(() => mergeCatalogs({ entries: [{ id: "same" }] },
    { release: "old", entries: [{ id: "same" }] }, "next", "forgeia-2"), /collision/);
});
