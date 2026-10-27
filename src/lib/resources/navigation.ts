import type { ResourceAudience } from "./audience";

export type ResourceTab = "sites" | "ui-kits" | "wordpress" | "drive" | "course-docs" | "coins";

export function resolveResourceTab(value: string | undefined, examplesAvailable: boolean, audience: ResourceAudience = "student"): ResourceTab {
  if (audience === "admin" && (value === "coins" || value === "course-docs")) return examplesAvailable ? "sites" : "ui-kits";
  // Les anciens liens « templates » ouvraient la recherche dans les deux dossiers.
  if (value === "templates") return "drive";
  if (value === "ui-kits" || value === "wordpress" || value === "drive" || value === "course-docs" || value === "coins") return value;
  return examplesAvailable ? "sites" : "ui-kits";
}
