import { describe, expect, it } from "vitest";

import { matchesEventFilters, type FilterableEvent } from "./event-filtering";

const now = Date.parse("2026-07-28T12:00:00+03:00");
const event: FilterableEvent = {
  city: "Helsinki",
  formats: ["gi", "no-gi"],
  priceCategory: "free",
  endAt: "2026-07-28T14:00:00+03:00",
};

describe("event list filters", () => {
  it("accepts a future event when all filters allow it", () => {
    expect(
      matchesEventFilters(
        event,
        { city: "all", format: "all" },
        new Set(["free", "paid", "unknown"]),
        now,
      ),
    ).toBe(true);
  });

  it("combines city, format, and price filters", () => {
    expect(
      matchesEventFilters(
        event,
        { city: "Helsinki", format: "gi" },
        new Set(["free"]),
        now,
      ),
    ).toBe(true);
    expect(
      matchesEventFilters(
        event,
        { city: "Espoo", format: "gi" },
        new Set(["free"]),
        now,
      ),
    ).toBe(false);
    expect(
      matchesEventFilters(
        event,
        { city: "Helsinki", format: "no-gi" },
        new Set(["paid"]),
        now,
      ),
    ).toBe(false);
  });

  it("shows no event when every price category is deselected", () => {
    expect(
      matchesEventFilters(
        event,
        { city: "all", format: "all" },
        new Set(),
        now,
      ),
    ).toBe(false);
  });

  it("removes an event immediately after its end time", () => {
    expect(
      matchesEventFilters(
        event,
        { city: "all", format: "all" },
        new Set(["free"]),
        Date.parse(event.endAt),
      ),
    ).toBe(false);
  });

  it("rejects invalid end timestamps", () => {
    expect(
      matchesEventFilters(
        { ...event, endAt: "invalid" },
        { city: "all", format: "all" },
        new Set(["free"]),
        now,
      ),
    ).toBe(false);
  });
});
