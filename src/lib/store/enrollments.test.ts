import { beforeEach, describe, expect, it, vi } from "vitest";

type Row = Record<string, unknown>;
const db = vi.hoisted(() => ({ calls: [] as [string, unknown[]][], rows: [] as Row[], updated: null as Row | null }));
vi.mock("@/lib/supabase/admin", () => {
  const builder: Record<string, unknown> = {};
  for (const method of ["from", "select", "eq", "order", "limit"]) {
    builder[method] = (...args: unknown[]) => {
      db.calls.push([method, args]);
      return builder;
    };
  }
  builder.update = (payload: Row) => {
    db.updated = payload;
    return builder;
  };
  builder.single = async () => ({ data: { ...db.rows[0], ...db.updated }, error: null });
  builder.maybeSingle = async () => ({ data: db.rows[0] ?? null, error: null });
  builder.then = (resolve: (value: unknown) => unknown) => resolve({ data: db.rows, error: null });
  return { getSupabaseAdmin: () => builder };
});
vi.mock("@/lib/store/progress", () => ({ initStudentProgress: vi.fn() }));

import { findEnrollmentByEmail, updateEnrollmentProfile, verifyPassword } from "@/lib/store/enrollments";

const row = (id: string, createdAt: string, extra: Row = {}): Row => ({
  id,
  full_name: "Awa Kossou",
  email: "awa@example.com",
  whatsapp: "0166368705",
  schedule: "saturday",
  status: "registered",
  payments: [{ kind: "registration", amount: 2500, status: "pending" }],
  created_at: createdAt,
  ...extra,
});

beforeEach(() => {
  db.calls.length = 0;
  db.rows = [];
  db.updated = null;
});

describe("findEnrollmentByEmail", () => {
  it("looks the email up in lower case, newest first", async () => {
    db.rows = [row("enr-2", "2026-10-30T10:00:00Z", { password_hash: "salt:hash" })];
    const found = await findEnrollmentByEmail(" Awa@Example.com ");
    expect(db.calls).toContainEqual(["eq", ["email", "awa@example.com"]]);
    expect(db.calls).toContainEqual(["order", ["created_at", { ascending: false }]]);
    expect(found?.id).toBe("enr-2");
  });

  it("prefers the paid account over a newer unpaid duplicate", async () => {
    db.rows = [
      row("enr-new", "2026-10-30T10:00:00Z"),
      row("enr-paid", "2026-10-01T10:00:00Z", {
        payments: [{ kind: "registration", amount: 2500, status: "paid" }],
      }),
    ];
    expect((await findEnrollmentByEmail("awa@example.com"))?.id).toBe("enr-paid");
  });

  it("among unpaid duplicates, prefers the one with a password", async () => {
    db.rows = [
      row("enr-new", "2026-10-30T10:00:00Z"),
      row("enr-pass", "2026-10-01T10:00:00Z", { password_hash: "salt:hash" }),
    ];
    expect((await findEnrollmentByEmail("awa@example.com"))?.id).toBe("enr-pass");
  });
});

describe("updateEnrollmentProfile", () => {
  it("stores the password exactly as typed, so the same string logs in", async () => {
    db.rows = [row("enr-1", "2026-10-30T10:00:00Z")];
    await updateEnrollmentProfile("enr-1", { password: "motdepasse1 " });
    const hash = String(db.updated?.password_hash);
    expect(verifyPassword("motdepasse1 ", hash)).toBe(true);
  });
});
