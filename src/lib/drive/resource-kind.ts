export type DriveResourceKind = "all" | "design-code" | "wordpress";

export function parseDriveResourceKind(value: string | null | undefined): DriveResourceKind {
  return value === "design-code" || value === "wordpress" ? value : "all";
}

// Les archives ne possèdent pas de catégorie éditoriale dans Drive. Ce filtre
// utilise leur nom ; la recherche « Toutes les archives » conserve l'accès au reste.
export function driveResourceKindFilter(kind: DriveResourceKind): string {
  if (kind === "all") return "";
  const terms = ["wordpress", "word press", "wp theme", "wp-theme", "wp_theme", "wp plugin", "wp-plugin", "elementor", "woocommerce"];
  const wordpress = `(${terms.map((term) => `name contains '${term}'`).join(" or ")})`;
  return kind === "wordpress" ? wordpress : `not ${wordpress}`;
}
