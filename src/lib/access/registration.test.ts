import { describe, expect, it } from "vitest";
import { hasRegistrationAccess } from "@/lib/access/registration";
import type { Enrollment } from "@/lib/types";

const registration = (status: "paid" | "pending") => [{ kind: "registration" as const, amount: 2500, status }];

describe("hasRegistrationAccess", () => {
  it.each<[string, Pick<Enrollment, "payments" | "accessOverride">, boolean]>([
    ["paid pre-registration", { payments: registration("paid") }, true],
    ["pending pre-registration", { payments: registration("pending") }, false],
    ["pending but full access granted by the admin", { payments: registration("pending"), accessOverride: "full" }, true],
    ["paid but blocked (blocking stays in the course access)", { payments: registration("paid"), accessOverride: "blocked" }, true],
    ["no payments at all", { payments: [] }, false],
  ])("%s", (_label, enrollment, expected) => {
    expect(hasRegistrationAccess(enrollment)).toBe(expected);
  });
});
