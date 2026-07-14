import { describe, expect, it } from "vitest";

import {
  eventIdentity,
  findDuplicateEventIds,
  formatEventDate,
  formatEventTime,
  sortEvents,
  type EventForDisplay,
} from "./events";

const event = (overrides: Partial<EventForDisplay> = {}): EventForDisplay => ({
  id: "event-1",
  title: "Example open mat",
  sport: "bjj",
  startAt: "2026-08-01T12:00:00+03:00",
  venue: { name: "Example Gym", city: "Helsinki" },
  ...overrides,
});

describe("event utilities", () => {
  it("sorts events chronologically without mutating the input", () => {
    const input = [
      event({ id: "later", startAt: "2026-08-02T12:00:00+03:00" }),
      event({ id: "earlier", startAt: "2026-08-01T12:00:00+03:00" }),
    ];

    expect(
      sortEvents(input, ({ startAt }) => startAt).map(({ id }) => id),
    ).toEqual(["earlier", "later"]);
    expect(input.map(({ id }) => id)).toEqual(["later", "earlier"]);
  });

  it("formats date and time in the Helsinki time zone", () => {
    expect(formatEventDate("2026-08-01T09:00:00Z")).toBe("la 1. elokuuta");
    expect(formatEventTime("2026-08-01T09:00:00Z")).toBe("12:00");
  });

  it("normalizes venue whitespace and casing in an event identity", () => {
    expect(
      eventIdentity(
        event({ venue: { name: "  EXAMPLE   GYM ", city: "Helsinki" } }),
      ),
    ).toBe("example gym|2026-08-01T12:00:00+03:00|bjj");
  });

  it("reports events with the same venue, time, and sport as duplicates", () => {
    const duplicate = event({ id: "event-2", title: "A different title" });
    const different = event({
      id: "event-3",
      sport: "submission-wrestling",
    });

    expect(findDuplicateEventIds([event(), duplicate, different])).toEqual([
      ["event-1", "event-2"],
    ]);
  });
});
