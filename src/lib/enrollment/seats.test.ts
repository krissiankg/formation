import { describe, expect, it } from "vitest";
import { computeSeats } from "@/lib/enrollment/seats";

const paid = (schedule: "saturday" | "saturday_pm" | "sunday") => ({
  schedule,
  payments: [{ kind: "registration", status: "paid" }],
});
const pending = (schedule: "saturday" | "saturday_pm" | "sunday") => ({
  schedule,
  payments: [{ kind: "registration", status: "pending" }],
});

describe("computeSeats", () => {
  it("counts only paid pre-registrations, per class", () => {
    const seats = computeSeats([paid("saturday"), paid("saturday"), pending("saturday"), paid("sunday")], 20);
    expect(seats.saturday).toEqual({ taken: 2, left: 18, full: false });
    expect(seats.saturday_pm).toEqual({ taken: 0, left: 20, full: false });
    expect(seats.sunday).toEqual({ taken: 1, left: 19, full: false });
  });

  it("marks a class full at the limit and never shows negative seats", () => {
    const seats = computeSeats(Array.from({ length: 21 }, () => paid("saturday_pm")), 20);
    expect(seats.saturday_pm).toEqual({ taken: 21, left: 0, full: true });
  });
});
