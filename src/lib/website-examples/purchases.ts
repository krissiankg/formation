import type { WebsiteExample } from "./types";

// Une archive commune à plusieurs pages ne se paie qu'une fois. Le droit reste
// valable quand la collection est republiée sous une nouvelle release.
export function exampleUnlockId(entry: Pick<WebsiteExample, "collection" | "archive">): string {
  return `html:${entry.collection || "forgeia-1"}:${entry.archive}`;
}
