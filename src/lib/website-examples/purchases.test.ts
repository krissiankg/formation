import { describe, expect, it } from "vitest";
import { exampleUnlockId } from "./purchases";
import { calculateFileCoinsCost } from "@/lib/wallet/pricing";

describe("achat des archives HTML", () => {
  it("facture une archive commune une seule fois et sépare les collections", () => {
    expect(exampleUnlockId({ archive: "restaurant" })).toBe("html:forgeia-1:restaurant");
    expect(exampleUnlockId({ archive: "restaurant", collection: "forgeia-1" })).toBe(exampleUnlockId({ archive: "restaurant" }));
    expect(exampleUnlockId({ archive: "restaurant", collection: "forgeia-2" })).not.toBe(exampleUnlockId({ archive: "restaurant" }));
  });
  it.each([[50, 10], [50.1, 15], [100, 15], [100.1, 20], [200, 20], [200.1, 30], [1000, 100], [1000.1, 110]])("applique le barème Drive pour %s Mo", (mb, cost) => {
    expect(calculateFileCoinsCost(mb * 1024 * 1024)).toBe(cost);
  });
});
