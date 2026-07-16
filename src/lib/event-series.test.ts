import { describe, expect, it } from "vitest";

import seriesData from "../../data/event-series.json";
import sourceRegistryData from "../../data/source-registry.json";
import eventsData from "../data/events.json";
import {
  materializeOccurrenceDates,
  occurrenceId,
  parseEventSeriesRegistry,
  type EventSeries,
} from "./event-series";

const registry = parseEventSeriesRegistry(seriesData);

describe("event series materialization", () => {
  it("materializes weekly dates only inside the publication window", () => {
    const series = registry.series.find(
      ({ id }) => id === "hjjk-saturday-open-mat",
    );

    expect(series).toBeDefined();
    expect(materializeOccurrenceDates(series!, registry.window)).toEqual([
      "2026-07-18",
      "2026-07-25",
      "2026-08-01",
      "2026-08-08",
    ]);
  });

  it("honours validity boundaries and excluded exception dates", () => {
    const fixture: EventSeries = {
      ...registry.series[0],
      validFrom: "2026-07-20",
      validThrough: "2026-08-08",
      excludedDates: ["2026-08-01"],
    };

    expect(materializeOccurrenceDates(fixture, registry.window)).toEqual([
      "2026-07-25",
      "2026-08-08",
    ]);
  });

  it("materializes MMA Vantaa after the official time conflict is resolved", () => {
    const series = registry.series.find(
      ({ id }) => id === "mma-vantaa-sunday-open-mat",
    );

    expect(series?.publicationStatus).toBe("publish");
    expect(materializeOccurrenceDates(series!, registry.window)).toEqual([
      "2026-07-19",
      "2026-07-26",
      "2026-08-02",
      "2026-08-09",
    ]);
  });

  it("materializes only the publishable AOGG visitor sessions", () => {
    const erottaja = registry.series.find(
      ({ id }) => id === "aogg-erottaja-sunday-nogi-open-mat",
    );
    const sornainen = registry.series.find(
      ({ id }) => id === "aogg-sornainen-colored-belts-nogi-open-mat",
    );

    expect(materializeOccurrenceDates(erottaja!, registry.window)).toEqual([
      "2026-07-19",
      "2026-07-26",
      "2026-08-02",
      "2026-08-09",
    ]);
    expect(materializeOccurrenceDates(sornainen!, registry.window)).toEqual([
      "2026-07-18",
      "2026-07-25",
      "2026-08-01",
      "2026-08-08",
    ]);
  });

  it("keeps Buli blocked until its dated calendar lists an occurrence", () => {
    const series = registry.series.find(
      ({ id }) => id === "buli-urhea-sunday-open-mat",
    );

    expect(series?.venueId).toBe("buli-urhea");
    expect(series?.publicationStatus).toBe("blocked_conflicting_source");
    expect(materializeOccurrenceDates(series!, registry.window)).toEqual([]);
  });

  it("references existing source-registry venues", () => {
    const venueIds = new Set(sourceRegistryData.venues.map(({ id }) => id));

    for (const series of registry.series) {
      expect(venueIds.has(series.venueId), series.id).toBe(true);
    }
  });

  it("rejects a publication status that contradicts its source check", () => {
    expect(() =>
      parseEventSeriesRegistry({
        ...seriesData,
        series: [
          {
            ...seriesData.series[0],
            publicationStatus: "blocked_conflicting_source",
          },
        ],
      }),
    ).toThrow(/must match its exception-check result/);
  });

  it("keeps series identifiers unique", () => {
    expect(new Set(registry.series.map(({ id }) => id)).size).toBe(
      registry.series.length,
    );
  });

  it("keeps recurring checked-in events aligned with publishable series", () => {
    const expectedIds = registry.series.flatMap((series) =>
      materializeOccurrenceDates(series, registry.window).map((date) =>
        occurrenceId(series.id, date),
      ),
    );
    const recurringSeriesIds = new Set(registry.series.map(({ id }) => id));
    const actualIds = eventsData
      .filter(({ schedule }) => recurringSeriesIds.has(schedule.seriesId))
      .map(({ id }) => id);

    expect(actualIds.sort()).toEqual(expectedIds.sort());
  });
});
