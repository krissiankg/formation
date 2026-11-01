import { describe, expect, it, vi } from "vitest";

const calls = vi.hoisted(() => [] as [string, unknown[]][]);
vi.mock("@/lib/supabase/admin", () => {
  const row = {
    id: "enr-2",
    full_name: "Awa Kossou",
    email: "awa@example.com",
    whatsapp: "0166368705",
    schedule: "saturday",
    status: "registered",
    password_hash: "salt:hash",
    payments: [],
    created_at: "2026-10-30T10:00:00Z",
  };
  const builder: Record<string, unknown> = {};
  for (const method of ["from", "select", "eq", "order", "limit"]) {
    builder[method] = (...args: unknown[]) => {
      calls.push([method, args]);
      return builder;
    };
  }
  builder.maybeSingle = async () => ({ data: row, error: null });
  return { getSupabaseAdmin: () => builder };
});
vi.mock("@/lib/store/progress", () => ({ initStudentProgress: vi.fn() }));

import { findEnrollmentByEmail } from "@/lib/store/enrollments";

describe("findEnrollmentByEmail", () => {
  it("takes the most recent account when the same email was registered twice", async () => {
    const found = await findEnrollmentByEmail(" Awa@Example.com ");

    expect(calls).toContainEqual(["eq", ["email", "awa@example.com"]]);
    expect(calls).toContainEqual(["order", ["created_at", { ascending: false }]]);
    expect(calls).toContainEqual(["limit", [1]]);
    expect(found?.id).toBe("enr-2");
    expect(found?.passwordHash).toBe("salt:hash");
  });
});
