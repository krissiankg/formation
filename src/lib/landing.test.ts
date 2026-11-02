import { describe, expect, it } from "vitest";
import { countdownLabel, daysUntilStart, seatsLabel } from "@/lib/landing";

describe("daysUntilStart", () => {
  it("counts calendar days in Benin time", () => {
    expect(daysUntilStart("2026-11-14", new Date("2026-11-02T10:00:00Z"))).toBe(12);
  });

  it("switches day at midnight in Cotonou, not at midnight UTC", () => {
    // 23:30 UTC on Nov 13 is already 00:30 on Nov 14 in Cotonou (UTC+1).
    expect(daysUntilStart("2026-11-14", new Date("2026-11-13T23:30:00Z"))).toBe(0);
    expect(daysUntilStart("2026-11-14", new Date("2026-11-13T22:30:00Z"))).toBe(1);
  });

  it("returns null once the cohort has started", () => {
    expect(daysUntilStart("2026-11-14", new Date("2026-11-15T08:00:00Z"))).toBeNull();
  });
});

describe("countdownLabel", () => {
  it.each([
    [12, "Démarrage dans 12 jours"],
    [1, "Démarrage demain"],
    [0, "Démarrage aujourd'hui"],
  ])("labels %i days as %s", (days, label) => {
    expect(countdownLabel(days)).toBe(label);
  });

  it("shows nothing after the start", () => {
    expect(countdownLabel(null)).toBeNull();
  });
});

describe("seatsLabel", () => {
  it("stays silent while a class is mostly empty", () => {
    expect(seatsLabel({ left: 20, full: false })).toBeNull();
    expect(seatsLabel({ left: 11, full: false })).toBeNull();
  });

  it("shows the real count once 10 seats or fewer are left", () => {
    expect(seatsLabel({ left: 10, full: false })).toBe("Plus que 10 places");
    expect(seatsLabel({ left: 1, full: false })).toBe("Plus qu'une place");
  });

  it("says when a class is full", () => {
    expect(seatsLabel({ left: 0, full: true })).toBe("Complet");
  });
});
