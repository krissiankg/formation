import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPasswordResetToken, passwordFingerprint, readPasswordResetToken } from "@/lib/auth/password-reset";
import { hmacSign } from "@/lib/auth/hmac";
import { hashPassword } from "@/lib/store/enrollments";

vi.mock("@/lib/supabase/admin", () => ({ getSupabaseAdmin: vi.fn() }));
vi.mock("@/lib/store/progress", () => ({ initStudentProgress: vi.fn() }));

const NOW = Date.UTC(2026, 10, 1, 12, 0, 0);

describe("password reset token", () => {
  beforeEach(() => vi.stubEnv("ADMIN_SESSION_SECRET", "reset-test-secret"));
  afterEach(() => vi.unstubAllEnvs());

  it("round trip returns the account and the password fingerprint", () => {
    const token = createPasswordResetToken({ id: "enr-1", passwordHash: "salt:hash" }, NOW);
    expect(readPasswordResetToken(token, NOW + 60_000)).toEqual({
      enrollmentId: "enr-1",
      fingerprint: passwordFingerprint("salt:hash"),
    });
  });

  it("expires after one hour", () => {
    const token = createPasswordResetToken({ id: "enr-1" }, NOW);
    expect(readPasswordResetToken(token, NOW + 3601_000)).toBeNull();
  });

  it("refuses a tampered signature", () => {
    const token = createPasswordResetToken({ id: "enr-1" }, NOW);
    const last = token.at(-1) === "A" ? "B" : "A";
    expect(readPasswordResetToken(`${token.slice(0, -1)}${last}`, NOW)).toBeNull();
  });

  it("refuses a student session token", () => {
    const exp = Math.floor(NOW / 1000) + 3600;
    const payload = `student:enr-1:${exp}`;
    expect(readPasswordResetToken(`${payload}.${hmacSign(payload)}`, NOW)).toBeNull();
  });

  it("the fingerprint changes when the password changes", () => {
    expect(passwordFingerprint(hashPassword("ancienmotdepasse"))).not.toBe(
      passwordFingerprint(hashPassword("nouveaumotdepasse")),
    );
    expect(passwordFingerprint(undefined)).toMatch(/^[0-9a-f]{16}$/);
  });
});
