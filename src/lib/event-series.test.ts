import { describe, expect, it } from "vitest";

import seriesData from "../../data/event-series.json";
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

  it("does not materialize a series with conflicting official evidence", () => {
    const series = registry.series.find(
      ({ id }) => id === "mma-vantaa-sunday-open-mat",
    );

    expect(series?.publicationStatus).toBe("blocked_conflicting_source");
    expect(materializeOccurrenceDates(series!, registry.window)).toEqual([]);
  });

  it("keeps the checked-in event file aligned with publishable series", () => {
    const expectedIds = registry.series.flatMap((series) =>
      materializeOccurrenceDates(series, registry.window).map((date) =>
        occurrenceId(series.id, date),
      ),
    );
    const actualIds = eventsData.map(({ id }) => id);

    expect(actualIds.sort()).toEqual(expectedIds.sort());
  });
});
