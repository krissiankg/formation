import { describe, expect, it } from "vitest";
import { resolveResourceTab } from "./navigation";
import { parseDriveResourceKind } from "@/lib/drive/resource-kind";

describe("navigation de la bibliothèque", () => {
  it("conserve la destination des anciens liens", () => {
    expect(resolveResourceTab("templates", true)).toBe("drive");
    expect(resolveResourceTab("sites", true)).toBe("sites");
    expect(resolveResourceTab("course-docs", true)).toBe("course-docs");
    expect(resolveResourceTab("coins", true)).toBe("coins");
  });
  it("ouvre une collection disponible même avec un lien inconnu", () => {
    expect(resolveResourceTab("sites", false)).toBe("ui-kits");
    expect(resolveResourceTab("unknown", true)).toBe("sites");
  });
  it("ne traite pas une valeur utilisateur comme un filtre Drive", () => {
    expect(parseDriveResourceKind("wordpress")).toBe("wordpress");
    expect(parseDriveResourceKind("design-code")).toBe("design-code");
    expect(parseDriveResourceKind("' or trashed = true")).toBe("all");
  });
});
