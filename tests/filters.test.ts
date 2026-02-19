import { describe, expect, it } from "vitest";
import { getDateRange } from "../lib/filters";

describe("getDateRange", () => {
  it("reads from/to query", () => {
    const p = new URLSearchParams({ from: "2024-01-01T00:00:00.000Z", to: "2024-01-01T01:00:00.000Z" });
    const { from, to } = getDateRange(p);
    expect(from.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(to.toISOString()).toBe("2024-01-01T01:00:00.000Z");
  });
});
